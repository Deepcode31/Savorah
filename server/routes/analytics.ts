import { Router, Response } from 'express';
import { Types } from 'mongoose';
import { AuthRequest, requireAuth } from '../middleware/auth.js';
import { Transaction } from '../models/Transaction.js';

const router = Router();
router.use(requireAuth);

router.get('/summary', async (req: AuthRequest, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.userId);
    const transactions = await Transaction.find({ userId }).lean();

    const totalIncomeTx = transactions
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const totalIncome = totalIncomeTx > 0 ? totalIncomeTx : req.user!.monthlyIncome;
    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

    const categoryMap: Record<string, number> = {};
    for (const t of transactions.filter((x) => x.type === 'expense')) {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    }
    const categoryBreakdown = Object.entries(categoryMap)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    // Monthly trend: last 6 months of expenses/income
    const monthlyMap: Record<string, { income: number; expense: number }> = {};
    for (const t of transactions) {
      const key = (t.date || '').slice(0, 7);
      if (!key) continue;
      if (!monthlyMap[key]) monthlyMap[key] = { income: 0, expense: 0 };
      if (t.type === 'income') monthlyMap[key].income += t.amount;
      else monthlyMap[key].expense += t.amount;
    }
    const monthlyTrend = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, v]) => ({ month, ...v }));

    res.json({
      totalIncome,
      totalExpense,
      netSavings,
      savingsRate,
      categoryBreakdown,
      monthlyTrend,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to compute analytics' });
  }
});

export default router;
