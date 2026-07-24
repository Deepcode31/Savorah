import { Router, Response } from 'express';
import { AuthRequest, requireAuth } from '../middleware/auth.js';
import { Transaction } from '../models/Transaction.js';
import {
  checkBudgetExceeded,
  serializeTransaction,
} from '../utils/helpers.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const docs = await Transaction.find({ userId: req.userId }).sort({ date: -1, createdAt: -1 });
    res.json({ transactions: docs.map(serializeTransaction) });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to list transactions' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, amount, type, category, date, paymentMethod, notes, receiptUrl, isEssential, tags, split } =
      req.body;
    if (!title || amount === undefined || !type || !category || !date) {
      return res.status(400).json({ error: 'title, amount, type, category, and date are required' });
    }
    const doc = await Transaction.create({
      userId: req.userId,
      title,
      amount: Number(amount),
      type,
      category,
      date,
      paymentMethod: paymentMethod || 'Other',
      notes,
      receiptUrl,
      isEssential: !!isEssential,
      tags: tags || [],
      split: split?.participants?.length
        ? {
            totalAmount: Number(split.totalAmount) || Number(amount),
            paidByMe: split.paidByMe !== false,
            participants: split.participants,
          }
        : undefined,
    });

    if (type === 'expense') {
      await checkBudgetExceeded(req.userId!, category);
    }

    res.status(201).json({ transaction: serializeTransaction(doc) });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create transaction' });
  }
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const doc = await Transaction.findOne({ _id: req.params.id, userId: req.userId });
    if (!doc) return res.status(404).json({ error: 'Transaction not found' });

    const fields = [
      'title',
      'amount',
      'type',
      'category',
      'date',
      'paymentMethod',
      'notes',
      'receiptUrl',
      'isEssential',
      'tags',
      'split',
    ] as const;
    for (const f of fields) {
      if (req.body[f] !== undefined) (doc as any)[f] = req.body[f];
    }
    if (req.body.amount !== undefined) doc.amount = Number(req.body.amount);
    await doc.save();

    if (doc.type === 'expense') {
      await checkBudgetExceeded(req.userId!, doc.category);
    }

    res.json({ transaction: serializeTransaction(doc) });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update transaction' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const doc = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!doc) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete transaction' });
  }
});

export default router;
