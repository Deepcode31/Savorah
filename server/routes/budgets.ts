import { Router, Response } from 'express';
import { AuthRequest, requireAuth } from '../middleware/auth.js';
import { Budget } from '../models/Budget.js';
import { getSpentByCategory, serializeBudget } from '../utils/helpers.js';
import { CATEGORY_COLORS } from '../seed.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const docs = await Budget.find({ userId: req.userId });
    const spentMap = await getSpentByCategory(req.userId!);
    res.json({
      budgets: docs.map((d) => serializeBudget(d, spentMap[d.category] || 0)),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to list budgets' });
  }
});

router.put('/', async (req: AuthRequest, res: Response) => {
  try {
    const items = req.body?.budgets;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'budgets array required' });
    }

    for (const item of items) {
      await Budget.findOneAndUpdate(
        { userId: req.userId, category: item.category },
        {
          userId: req.userId,
          category: item.category,
          limit: Math.max(0, Number(item.limit) || 0),
          color: item.color || CATEGORY_COLORS[item.category] || '#64748B',
        },
        { upsert: true, new: true }
      );
    }

    const docs = await Budget.find({ userId: req.userId });
    const spentMap = await getSpentByCategory(req.userId!);
    res.json({
      budgets: docs.map((d) => serializeBudget(d, spentMap[d.category] || 0)),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to upsert budgets' });
  }
});

router.patch('/:category', async (req: AuthRequest, res: Response) => {
  try {
    const category = decodeURIComponent(req.params.category);
    const limit = Math.max(10, Number(req.body.limit) || 10);
    const doc = await Budget.findOneAndUpdate(
      { userId: req.userId, category },
      {
        userId: req.userId,
        category,
        limit,
        color: req.body.color || CATEGORY_COLORS[category] || '#64748B',
      },
      { upsert: true, new: true }
    );
    const spentMap = await getSpentByCategory(req.userId!);
    res.json({ budget: serializeBudget(doc, spentMap[category] || 0) });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update budget' });
  }
});

export default router;
