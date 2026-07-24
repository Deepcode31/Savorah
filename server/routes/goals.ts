import { Router, Response } from 'express';
import { AuthRequest, requireAuth } from '../middleware/auth.js';
import { Goal } from '../models/Goal.js';
import { checkGoalAchieved, serializeGoal } from '../utils/helpers.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const docs = await Goal.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ goals: docs.map(serializeGoal) });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to list goals' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, targetAmount, deadline, category, imageUrl, notes, currentAmount } = req.body;
    if (!title || !targetAmount || !deadline || !category) {
      return res.status(400).json({ error: 'title, targetAmount, deadline, and category are required' });
    }
    const doc = await Goal.create({
      userId: req.userId,
      title,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount) || 0,
      deadline,
      category,
      imageUrl,
      notes,
    });
    res.status(201).json({ goal: serializeGoal(doc) });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create goal' });
  }
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const doc = await Goal.findOne({ _id: req.params.id, userId: req.userId });
    if (!doc) return res.status(404).json({ error: 'Goal not found' });

    const previousAmount = doc.currentAmount;

    if (req.body.contribute !== undefined) {
      doc.currentAmount = Math.max(0, doc.currentAmount + Number(req.body.contribute));
    }
    if (req.body.title !== undefined) doc.title = req.body.title;
    if (req.body.targetAmount !== undefined) doc.targetAmount = Number(req.body.targetAmount);
    if (req.body.currentAmount !== undefined) doc.currentAmount = Number(req.body.currentAmount);
    if (req.body.deadline !== undefined) doc.deadline = req.body.deadline;
    if (req.body.category !== undefined) doc.category = req.body.category;
    if (req.body.imageUrl !== undefined) doc.imageUrl = req.body.imageUrl;
    if (req.body.notes !== undefined) doc.notes = req.body.notes;

    await doc.save();
    const achieved = await checkGoalAchieved(req.userId!, doc, previousAmount);
    res.json({ goal: serializeGoal(doc), achieved });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update goal' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const doc = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!doc) return res.status(404).json({ error: 'Goal not found' });
    res.json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete goal' });
  }
});

export default router;
