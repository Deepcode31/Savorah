import { Router, Response } from 'express';
import { AuthRequest, requireAuth } from '../middleware/auth.js';
import { chatJson, chatText, chatStream, chatCompletion, extractJson } from '../services/openrouter.js';
import { Transaction } from '../models/Transaction.js';
import { Budget } from '../models/Budget.js';
import { Goal } from '../models/Goal.js';
import { getSpentByCategory } from '../utils/helpers.js';

const router = Router();
router.use(requireAuth);

const CATEGORIES = [
  'Housing & Rent',
  'Groceries & Dining',
  'Utilities & Bills',
  'Entertainment & Leisure',
  'Education & Books',
  'Healthcare & Medical',
  'Transport & Fuel',
  'Investments & Savings',
  'Shopping & Apparel',
  'Childcare & Family',
  'Salary & Allowance',
  'Other',
];

async function buildUserFinanceContext(userId: string, user: any) {
  const [transactions, budgets, goals, spentMap] = await Promise.all([
    Transaction.find({ userId }).sort({ date: -1 }).limit(40).lean(),
    Budget.find({ userId }).lean(),
    Goal.find({ userId }).lean(),
    getSpentByCategory(userId),
  ]);

  const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const totalIncome = income > 0 ? income : user.monthlyIncome || 0;

  return {
    name: user.name,
    persona: user.persona,
    currency: '₹',
    monthlyIncome: user.monthlyIncome,
    totalIncome,
    totalExpense: expense,
    netSavings: totalIncome - expense,
    budgets: budgets.map((b) => ({
      category: b.category,
      limit: b.limit,
      spent: spentMap[b.category] || 0,
    })),
    goals: goals.map((g) => ({
      title: g.title,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
    })),
    recentTransactions: transactions.slice(0, 20).map((t) => ({
      title: t.title,
      amount: t.amount,
      type: t.type,
      category: t.category,
      date: t.date,
    })),
  };
}

router.post('/budget-recommendation', async (req: AuthRequest, res: Response) => {
  try {
    const persona = req.body.persona || req.user?.persona || 'professional';
    const monthlyIncome = req.body.monthlyIncome ?? req.user?.monthlyIncome ?? 45000;
    const goals = req.body.goals || [];

    const data = await chatJson(
      [
        {
          role: 'system',
          content:
            'You are a financial planner for Indian users (INR ₹). Reply with valid JSON only. All money values in rupees. Do not invent USD.',
        },
        {
          role: 'user',
          content: `Create a starter monthly budget in INR.
Persona: ${persona}
Monthly income: ₹${monthlyIncome}
Goals: ${JSON.stringify(goals)}

Return JSON:
{
  "recommendedBudgets": [
    { "category": string, "recommendedLimit": number, "percentage": number, "reason": string }
  ],
  "savingsTargetRecommended": number,
  "topAdvice": [string, string, string]
}
Categories should use: ${CATEGORIES.filter((c) => c !== 'Salary & Allowance').join(', ')}`,
        },
      ],
      'json'
    );

    res.json(data);
  } catch (error: any) {
    console.error('Budget recommendation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate budget recommendation' });
  }
});

router.post('/auto-categorize', async (req: AuthRequest, res: Response) => {
  try {
    const { title, amount } = req.body;
    const persona = req.body.persona || req.user?.persona || 'professional';

    const data = await chatJson(
      [
        {
          role: 'system',
          content: 'Categorize Indian financial transactions. Reply with valid JSON only.',
        },
        {
          role: 'user',
          content: `Title: "${title}"
Amount: ₹${amount}
Persona: ${persona}
Allowed categories: ${CATEGORIES.join(', ')}

Return JSON:
{ "category": string, "isEssential": boolean, "tags": string[], "insight": string }`,
        },
      ],
      'fast'
    );

    if (!CATEGORIES.includes(data.category)) data.category = 'Other';
    res.json(data);
  } catch (error: any) {
    console.error('Auto categorize error:', error);
    res.status(500).json({ error: error.message || 'Auto categorize failed' });
  }
});

router.post('/insights', async (req: AuthRequest, res: Response) => {
  try {
    const ctx = await buildUserFinanceContext(req.userId!, req.user);

    const data = await chatJson(
      [
        {
          role: 'system',
          content:
            'You are Savorah spending analyst for India (INR). Use ONLY the provided numbers. Never invent balances. Reply JSON only.',
        },
        {
          role: 'user',
          content: `Analyze this user's finances:
${JSON.stringify(ctx)}

Return JSON:
{
  "healthScore": number,
  "statusSummary": string,
  "anomaliesDetected": [{ "title": string, "description": string, "severity": "high"|"medium"|"low" }],
  "savingsOpportunities": [string, string],
  "monthlyForecast": { "projectedSavings": number, "burnRatePercentage": number }
}`,
        },
      ],
      'json'
    );

    res.json(data);
  } catch (error: any) {
    console.error('Insights error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze spending' });
  }
});

router.post('/chat', async (req: AuthRequest, res: Response) => {
  try {
    const { messages } = req.body;
    const ctx = await buildUserFinanceContext(req.userId!, req.user);
    const persona = ctx.persona;

    const systemInstruction = `You are Savorah AI, a practical financial coach for Indian users.
Currency is always Indian Rupees (₹). Never use dollars or invent fake account balances.
Use ONLY this user data when discussing their finances:
${JSON.stringify(ctx)}

Tone by persona (${persona}):
- student: encouraging, small daily habits
- professional: analytical, goals & investing
- family: household bills & buffers
- senior: clear, calm, fixed-income focused

If data is missing, say so. Keep answers concise and actionable.

FORMATTING (important):
- Reply in clean GitHub-flavored Markdown.
- When you compare categories, months, budgets vs spend, or list multiple numbers, ALWAYS use a Markdown table with a header row (e.g. | Category | Spent | Budget |).
- Use **bold** for key rupee figures, and short bullet lists for tips.
- Format money as ₹ with Indian digit grouping (e.g. ₹12,500). Keep it scannable.
- For formulas, prefer plain readable math like: **Savings Rate** = (Net Savings ÷ Monthly Income) × 100.
- If you must use LaTeX, wrap it ONLY in $...$ (inline) or $$...$$ (block). Never use bare [ \\text{...} ] or raw TeX without delimiters.`;

    const history = (messages || [])
      .filter((m: any) => m.text || m.content)
      .map((m: any) => ({
        role: (m.sender === 'user' || m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: (m.text || m.content) as string,
      }));

    const text = await chatText(
      [{ role: 'system', content: systemInstruction }, ...history],
      'chat'
    );

    res.json({ text, groundingUrls: [] });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Chatbot execution failed' });
  }
});

/** Streaming version of /chat — emits Server-Sent Events with token deltas. */
router.post('/chat/stream', async (req: AuthRequest, res: Response) => {
  try {
    const { messages } = req.body;
    const ctx = await buildUserFinanceContext(req.userId!, req.user);
    const persona = ctx.persona;

    const systemInstruction = `You are Savorah AI, a practical financial coach for Indian users.
Currency is always Indian Rupees (₹). Never use dollars or invent fake account balances.
Use ONLY this user data when discussing their finances:
${JSON.stringify(ctx)}

Tone by persona (${persona}):
- student: encouraging, small daily habits
- professional: analytical, goals & investing
- family: household bills & buffers
- senior: clear, calm, fixed-income focused

If data is missing, say so. Keep answers concise and actionable.

FORMATTING (important):
- Reply in clean GitHub-flavored Markdown.
- When you compare categories, months, budgets vs spend, or list multiple numbers, ALWAYS use a Markdown table with a header row (e.g. | Category | Spent | Budget |).
- Use **bold** for key rupee figures, and short bullet lists for tips.
- Format money as ₹ with Indian digit grouping (e.g. ₹12,500). Keep it scannable.
- For formulas, prefer plain readable math like: **Savings Rate** = (Net Savings ÷ Monthly Income) × 100.
- If you must use LaTeX, wrap it ONLY in $...$ (inline) or $$...$$ (block). Never use bare [ \\text{...} ] or raw TeX without delimiters.`;

    const history = (messages || [])
      .filter((m: any) => m.text || m.content)
      .map((m: any) => ({
        role: (m.sender === 'user' || m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: (m.text || m.content) as string,
      }));

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    await chatStream(
      [{ role: 'system', content: systemInstruction }, ...history],
      (delta) => {
        res.write(`data: ${JSON.stringify({ delta })}\n\n`);
      },
      'chat'
    );

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Chat stream error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Chat stream failed' });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message || 'Chat stream failed' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
});

router.post('/monthly-report', async (req: AuthRequest, res: Response) => {
  try {
    const ctx = await buildUserFinanceContext(req.userId!, req.user);
    const data = await chatJson(
      [
        {
          role: 'system',
          content: 'Write a plain-language monthly financial review in INR. JSON only. Use provided numbers only.',
        },
        {
          role: 'user',
          content: `User data: ${JSON.stringify(ctx)}

Return JSON:
{
  "headline": string,
  "executiveSummary": string,
  "keyHighlights": [string, string, string],
  "recommendationNextMonth": string
}`,
        },
      ],
      'json'
    );
    res.json(data);
  } catch (error: any) {
    console.error('Monthly report error:', error);
    res.status(500).json({ error: error.message || 'Report generation failed' });
  }
});

router.post('/image', async (req: AuthRequest, res: Response) => {
  const prompt = req.body?.prompt || 'financial goals';
  res.json({
    imageUrl:
      'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800',
    textNote: `Vision board placeholder for: ${prompt}`,
  });
});

/** Parse a bank SMS / UPI alert into one transaction. */
router.post('/parse-sms', async (req: AuthRequest, res: Response) => {
  try {
    const text = String(req.body?.text || '').trim();
    if (!text) return res.status(400).json({ error: 'SMS text is required' });

    const data = await chatJson(
      [
        {
          role: 'system',
          content:
            'Extract one Indian bank/UPI SMS into a transaction. Amounts are INR. Reply JSON only.',
        },
        {
          role: 'user',
          content: `SMS:
"""
${text}
"""

Return JSON:
{
  "title": string,
  "amount": number,
  "type": "expense"|"income",
  "category": string,
  "date": "YYYY-MM-DD",
  "paymentMethod": string,
  "isEssential": boolean,
  "tags": string[],
  "confidence": number,
  "notes": string
}
category must be one of: ${CATEGORIES.join(', ')}
If date missing use today's date ${new Date().toISOString().slice(0, 10)}.
paymentMethod one of: Credit Card, Debit Card, Bank Transfer, UPI / Cash, PayPal, Other.`,
        },
      ],
      'fast'
    );

    if (!CATEGORIES.includes(data.category)) data.category = 'Other';
    data.amount = Math.abs(Number(data.amount) || 0);
    data.confidence = Math.min(100, Math.max(0, Number(data.confidence) || 70));
    data.source = 'sms';
    res.json({ transaction: data });
  } catch (error: any) {
    console.error('parse-sms error:', error);
    res.status(500).json({ error: error.message || 'SMS parse failed' });
  }
});

/** Parse statement text (CSV / pasted rows) into multiple transactions. */
router.post('/parse-statement', async (req: AuthRequest, res: Response) => {
  try {
    const text = String(req.body?.text || '').trim();
    if (!text) return res.status(400).json({ error: 'Statement text is required' });

    // Cap input size for free models
    const clipped = text.slice(0, 28000);

    const data = await chatJson<{ transactions: any[] }>(
      [
        {
          role: 'system',
          content:
            'Extract bank statement rows into transactions for an Indian user (INR). Reply with JSON only. Do not invent rows that are not in the text.',
        },
        {
          role: 'user',
          content: `Statement content:
"""
${clipped}
"""

Return JSON:
{
  "transactions": [
    {
      "title": string,
      "amount": number,
      "type": "expense"|"income",
      "category": string,
      "date": "YYYY-MM-DD",
      "paymentMethod": string,
      "isEssential": boolean,
      "tags": string[],
      "confidence": number
    }
  ]
}
category must be one of: ${CATEGORIES.join(', ')}
Skip headers/balances/totals. Prefer up to 40 clearest transactions.`,
        },
      ],
      'json'
    );

    const transactions = (data.transactions || [])
      .filter((t) => t && t.title && Number(t.amount) > 0)
      .map((t) => ({
        ...t,
        amount: Math.abs(Number(t.amount)),
        type: t.type === 'income' ? 'income' : 'expense',
        category: CATEGORIES.includes(t.category) ? t.category : 'Other',
        date: t.date || new Date().toISOString().slice(0, 10),
        paymentMethod: t.paymentMethod || 'Bank Transfer',
        confidence: Math.min(100, Math.max(0, Number(t.confidence) || 75)),
        source: 'statement',
      }));

    res.json({ transactions });
  } catch (error: any) {
    console.error('parse-statement error:', error);
    res.status(500).json({ error: error.message || 'Statement parse failed' });
  }
});

/** Parse receipt image (base64) via vision model. */
router.post('/parse-receipt', async (req: AuthRequest, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body || {};
    if (!imageBase64) return res.status(400).json({ error: 'imageBase64 is required' });

    const dataUrl = String(imageBase64).startsWith('data:')
      ? String(imageBase64)
      : `data:${mimeType};base64,${imageBase64}`;

    const raw = await chatCompletion({
      modelKind: 'vision',
      temperature: 0.2,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Extract the purchase from this receipt image for an Indian finance app (INR ₹).
Reply with JSON only:
{
  "title": string,
  "amount": number,
  "type": "expense",
  "category": string,
  "date": "YYYY-MM-DD",
  "paymentMethod": string,
  "isEssential": boolean,
  "tags": string[],
  "confidence": number,
  "notes": string
}
Categories: ${CATEGORIES.join(', ')}`,
            },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
    });
    const data = extractJson<any>(raw);

    if (!CATEGORIES.includes(data.category)) data.category = 'Other';
    data.amount = Math.abs(Number(data.amount) || 0);
    data.confidence = Math.min(100, Math.max(0, Number(data.confidence) || 70));
    data.source = 'receipt';
    data.date = data.date || new Date().toISOString().slice(0, 10);
    res.json({ transaction: data });
  } catch (error: any) {
    console.error('parse-receipt error:', error);
    res.status(500).json({ error: error.message || 'Receipt parse failed' });
  }
});

export default router;
