import { Router, Response } from 'express';
import { AuthRequest, requireAuth } from '../middleware/auth.js';
import { Notification } from '../models/Notification.js';
import { serializeNotification, todayISO } from '../utils/helpers.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const docs = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ notifications: docs.map(serializeNotification) });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to list notifications' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, message, type } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'title and message required' });
    }
    const doc = await Notification.create({
      userId: req.userId,
      title,
      message,
      type: type || 'info',
      date: todayISO(),
      read: false,
    });
    res.status(201).json({ notification: serializeNotification(doc) });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create notification' });
  }
});

router.patch('/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    const doc = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { read: true },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: 'Notification not found' });
    res.json({ notification: serializeNotification(doc) });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to mark read' });
  }
});

router.delete('/', async (req: AuthRequest, res: Response) => {
  try {
    await Notification.deleteMany({ userId: req.userId });
    res.json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to clear notifications' });
  }
});

export default router;
