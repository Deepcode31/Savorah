import { Router, Response } from 'express';
import { AuthRequest, requireAuth, toPublicUser } from '../middleware/auth.js';
import { UserPersona } from '../models/User.js';
import { Budget } from '../models/Budget.js';
import { Goal } from '../models/Goal.js';
import { CATEGORY_COLORS, seedPersonaData } from '../seed.js';
import { chatJson } from '../services/openrouter.js';

const router = Router();

router.use(requireAuth);

router.patch('/me', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { name, persona, monthlyIncome, currency, avatar, onboardingComplete } = req.body;

    if (name !== undefined) user.name = name;
    if (persona !== undefined) user.persona = persona;
    if (monthlyIncome !== undefined) user.monthlyIncome = Number(monthlyIncome);
    if (currency !== undefined) user.currency = currency;
    if (avatar !== undefined) user.avatar = avatar;
    if (onboardingComplete !== undefined) user.onboardingComplete = !!onboardingComplete;

    await user.save();
    res.json({ user: toPublicUser(user) });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message || 'Failed to update profile' });
  }
});

router.post('/me/onboarding', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { name, avatar, monthlyIncome, persona, goals = [], useAiBudget = true } = req.body;

    if (typeof name === 'string' && name.trim()) user.name = name.trim();
    if (typeof avatar === 'string') user.avatar = avatar;
    if (persona) user.persona = persona as UserPersona;
    if (monthlyIncome !== undefined) user.monthlyIncome = Number(monthlyIncome);
    user.onboardingComplete = true;
    await user.save();

    // Clear existing budgets and optionally seed AI recommendations
    await Budget.deleteMany({ userId: user._id });

    if (useAiBudget) {
      try {
        const ai = await chatJson<{
          recommendedBudgets: Array<{
            category: string;
            recommendedLimit: number;
            percentage?: number;
            reason?: string;
          }>;
        }>(
          [
            {
              role: 'system',
              content: 'You are an expert financial planner for Savorah. Always respond with valid JSON only.',
            },
            {
              role: 'user',
              content: `Act as an expert financial planner for Savorah.
User Persona: ${user.persona}
Monthly Income: ₹${user.monthlyIncome}
Financial Goals: ${JSON.stringify(goals || [])}

Provide a starter monthly budget allocation breakdown in JSON format.
Include recommended category limits for:
- Housing & Rent
- Groceries & Dining
- Utilities & Bills
- Transport & Fuel
- Entertainment & Leisure
- Investments & Savings
- Healthcare & Medical
- Emergency Buffer

Return JSON matching:
{
  "recommendedBudgets": [
    { "category": string, "recommendedLimit": number, "percentage": number, "reason": string }
  ],
  "savingsTargetRecommended": number,
  "topAdvice": [string, string, string]
}`,
            },
          ],
          'json'
        );

        if (ai.recommendedBudgets?.length) {
          await Budget.insertMany(
            ai.recommendedBudgets.map((b) => ({
              userId: user._id,
              category: b.category === 'Emergency Buffer' ? 'Other' : b.category,
              limit: Math.max(10, Math.round(b.recommendedLimit)),
              color: CATEGORY_COLORS[b.category] || CATEGORY_COLORS.Other,
            }))
          );
        }
      } catch (aiErr) {
        console.warn('AI budget during onboarding failed, using defaults:', aiErr);
        await seedDefaultBudgets(user._id.toString(), user.monthlyIncome);
      }
    } else {
      await seedDefaultBudgets(user._id.toString(), user.monthlyIncome);
    }

    if (Array.isArray(goals) && goals.length) {
      await Goal.insertMany(
        goals.map((g: any) => ({
          userId: user._id,
          title: g.title || 'Savings Goal',
          targetAmount: Number(g.targetAmount) || 1000,
          currentAmount: Number(g.currentAmount) || 0,
          deadline: g.deadline || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
          category: g.category || 'Investments & Savings',
          notes: g.notes,
        }))
      );
    }

    res.json({ user: toPublicUser(user), message: 'Onboarding complete' });
  } catch (error: any) {
    console.error('Onboarding error:', error);
    res.status(500).json({ error: error.message || 'Onboarding failed' });
  }
});

router.post('/me/reset-demo', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    await seedPersonaData(user._id, user.persona);
    res.json({ message: 'Demo data reset' });
  } catch (error: any) {
    console.error('Reset demo error:', error);
    res.status(500).json({ error: error.message || 'Reset failed' });
  }
});

async function seedDefaultBudgets(userId: string, income: number) {
  const allocations = [
    { category: 'Housing & Rent', pct: 0.3 },
    { category: 'Groceries & Dining', pct: 0.15 },
    { category: 'Utilities & Bills', pct: 0.1 },
    { category: 'Transport & Fuel', pct: 0.08 },
    { category: 'Entertainment & Leisure', pct: 0.07 },
    { category: 'Investments & Savings', pct: 0.15 },
    { category: 'Healthcare & Medical', pct: 0.08 },
    { category: 'Other', pct: 0.07 },
  ];
  await Budget.insertMany(
    allocations.map((a) => ({
      userId,
      category: a.category,
      limit: Math.max(10, Math.round(income * a.pct)),
      color: CATEGORY_COLORS[a.category] || '#64748B',
    }))
  );
}

export default router;
