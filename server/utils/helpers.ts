import { Types } from 'mongoose';
import { Notification } from '../models/Notification.js';
import { Budget } from '../models/Budget.js';
import { Transaction } from '../models/Transaction.js';
import { Goal } from '../models/Goal.js';

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export async function createNotification(
  userId: string | Types.ObjectId,
  title: string,
  message: string,
  type: 'warning' | 'info' | 'success' | 'bill' = 'info'
) {
  return Notification.create({
    userId,
    title,
    message,
    type,
    date: todayISO(),
    read: false,
  });
}

/** After expense mutations, check if any budget category is exceeded. */
export async function checkBudgetExceeded(
  userId: string | Types.ObjectId,
  category: string
) {
  const budget = await Budget.findOne({ userId, category });
  if (!budget) return;

  const spentAgg = await Transaction.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId.toString()),
        type: 'expense',
        category,
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const spent = spentAgg[0]?.total || 0;

  if (spent > budget.limit) {
    await createNotification(
      userId,
      `Budget Limit Exceeded: ${category}`,
      `Your spending in ${category} (₹${spent.toLocaleString('en-IN')}) has exceeded your limit of ₹${budget.limit.toLocaleString('en-IN')}!`,
      'warning'
    );
  }
}

/** After goal contribution, notify if target reached. */
export async function checkGoalAchieved(
  userId: string | Types.ObjectId,
  goal: { title: string; targetAmount: number; currentAmount: number },
  previousAmount: number
) {
  if (goal.currentAmount >= goal.targetAmount && previousAmount < goal.targetAmount) {
    await createNotification(
      userId,
      `Goal Achieved: ${goal.title}!`,
      `Congratulations! You reached your savings target of ₹${goal.targetAmount.toLocaleString('en-IN')}.`,
      'success'
    );
    return true;
  }
  return false;
}

export function serializeTransaction(doc: any) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    amount: doc.amount,
    type: doc.type,
    category: doc.category,
    date: doc.date,
    paymentMethod: doc.paymentMethod,
    notes: doc.notes,
    receiptUrl: doc.receiptUrl,
    isEssential: doc.isEssential,
    tags: doc.tags || [],
    split: doc.split?.participants?.length
      ? {
          totalAmount: doc.split.totalAmount,
          paidByMe: doc.split.paidByMe !== false,
          participants: doc.split.participants,
        }
      : undefined,
  };
}

export function serializeBudget(doc: any, spent = 0) {
  return {
    category: doc.category,
    limit: doc.limit,
    spent,
    color: doc.color,
  };
}

export function serializeGoal(doc: any) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    targetAmount: doc.targetAmount,
    currentAmount: doc.currentAmount,
    deadline: doc.deadline,
    category: doc.category,
    imageUrl: doc.imageUrl,
    notes: doc.notes,
  };
}

export function serializeNotification(doc: any) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    message: doc.message,
    type: doc.type,
    date: doc.date,
    read: doc.read,
  };
}

export async function getSpentByCategory(userId: string | Types.ObjectId) {
  const rows = await Transaction.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId.toString()),
        type: 'expense',
      },
    },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
  ]);
  const map: Record<string, number> = {};
  for (const row of rows) map[row._id] = row.total;
  return map;
}
