import { Types } from 'mongoose';
import { Transaction } from './models/Transaction.js';
import { Budget } from './models/Budget.js';
import { Goal } from './models/Goal.js';
import { Notification } from './models/Notification.js';
import { UserPersona } from './models/User.js';

const CATEGORY_COLORS: Record<string, string> = {
  'Housing & Rent': '#10B981',
  'Groceries & Dining': '#3B82F6',
  'Utilities & Bills': '#F59E0B',
  'Entertainment & Leisure': '#EC4899',
  'Education & Books': '#8B5CF6',
  'Healthcare & Medical': '#EF4444',
  'Transport & Fuel': '#06B6D4',
  'Investments & Savings': '#14B8A6',
  'Shopping & Apparel': '#6366F1',
  'Childcare & Family': '#F97316',
  'Salary & Allowance': '#22C55E',
  Other: '#64748B',
};

type SeedBundle = {
  transactions: Array<{
    title: string;
    amount: number;
    type: 'expense' | 'income';
    category: string;
    date: string;
    paymentMethod: string;
    isEssential?: boolean;
  }>;
  budgets: Array<{ category: string; limit: number }>;
  goals: Array<{
    title: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    category: string;
    notes?: string;
  }>;
  notifications: Array<{
    title: string;
    message: string;
    type: 'warning' | 'info' | 'success' | 'bill';
    date: string;
  }>;
};

const PERSONA_SEEDS: Record<UserPersona, SeedBundle> = {
  student: {
    transactions: [
      { title: 'Monthly Allowance', amount: 800, type: 'income', category: 'Salary & Allowance', date: '2026-07-01', paymentMethod: 'Bank Transfer' },
      { title: 'Part-time Tutoring', amount: 400, type: 'income', category: 'Salary & Allowance', date: '2026-07-10', paymentMethod: 'PayPal' },
      { title: 'University Textbooks & Notes', amount: 145, type: 'expense', category: 'Education & Books', date: '2026-07-02', paymentMethod: 'Debit Card', isEssential: true },
      { title: 'Campus Cafeteria & Snacks', amount: 85, type: 'expense', category: 'Groceries & Dining', date: '2026-07-05', paymentMethod: 'UPI / Cash', isEssential: true },
      { title: 'Dorm Room Electricity & Wi-Fi', amount: 65, type: 'expense', category: 'Utilities & Bills', date: '2026-07-08', paymentMethod: 'Debit Card', isEssential: true },
      { title: 'Weekend Movie & Games', amount: 45, type: 'expense', category: 'Entertainment & Leisure', date: '2026-07-12', paymentMethod: 'Credit Card', isEssential: false },
      { title: 'Public Transport Pass', amount: 50, type: 'expense', category: 'Transport & Fuel', date: '2026-07-15', paymentMethod: 'Debit Card', isEssential: true },
      { title: 'Thrift Shop Clothes', amount: 35, type: 'expense', category: 'Shopping & Apparel', date: '2026-07-18', paymentMethod: 'Debit Card', isEssential: false },
    ],
    budgets: [
      { category: 'Groceries & Dining', limit: 250 },
      { category: 'Education & Books', limit: 200 },
      { category: 'Utilities & Bills', limit: 100 },
      { category: 'Entertainment & Leisure', limit: 80 },
      { category: 'Transport & Fuel', limit: 70 },
    ],
    goals: [
      { title: 'New Laptop for Semester', targetAmount: 900, currentAmount: 520, deadline: '2026-09-15', category: 'Education & Books', notes: 'Saving part of tutoring money every week.' },
      { title: 'Summer Hackathon Trip', targetAmount: 300, currentAmount: 180, deadline: '2026-08-30', category: 'Entertainment & Leisure', notes: 'Hotel & train tickets' },
    ],
    notifications: [
      { title: 'Low Balance Warning', message: 'You have spent 72% of your Education budget this month.', type: 'warning', date: '2026-07-15' },
      { title: 'Goal Milestone!', message: 'You are over 50% toward your New Laptop goal!', type: 'success', date: '2026-07-18' },
    ],
  },
  professional: {
    transactions: [
      { title: 'Tech Corp Salary', amount: 6500, type: 'income', category: 'Salary & Allowance', date: '2026-07-01', paymentMethod: 'Bank Direct Deposit' },
      { title: 'Luxury Apartment Rent', amount: 1800, type: 'expense', category: 'Housing & Rent', date: '2026-07-01', paymentMethod: 'Bank Auto-Pay', isEssential: true },
      { title: 'Monthly Index Fund (S&P 500)', amount: 1200, type: 'expense', category: 'Investments & Savings', date: '2026-07-03', paymentMethod: 'Investment Account', isEssential: true },
      { title: 'Organic Groceries & Coffee', amount: 480, type: 'expense', category: 'Groceries & Dining', date: '2026-07-07', paymentMethod: 'Credit Card', isEssential: true },
      { title: 'EV Charging & Highway Tolls', amount: 130, type: 'expense', category: 'Transport & Fuel', date: '2026-07-10', paymentMethod: 'Credit Card', isEssential: true },
      { title: 'Gym & Spa Membership', amount: 110, type: 'expense', category: 'Healthcare & Medical', date: '2026-07-11', paymentMethod: 'Credit Card', isEssential: false },
      { title: 'Fine Dining & Team Dinner', amount: 220, type: 'expense', category: 'Entertainment & Leisure', date: '2026-07-14', paymentMethod: 'Credit Card', isEssential: false },
      { title: 'Cloud Software Subscriptions', amount: 85, type: 'expense', category: 'Utilities & Bills', date: '2026-07-16', paymentMethod: 'Credit Card', isEssential: false },
    ],
    budgets: [
      { category: 'Housing & Rent', limit: 2000 },
      { category: 'Investments & Savings', limit: 1500 },
      { category: 'Groceries & Dining', limit: 600 },
      { category: 'Entertainment & Leisure', limit: 400 },
      { category: 'Transport & Fuel', limit: 200 },
    ],
    goals: [
      { title: 'Home Down Payment Fund', targetAmount: 35000, currentAmount: 22400, deadline: '2027-06-30', category: 'Investments & Savings', notes: 'Automated monthly transfer into high yield savings.' },
      { title: 'Japan Vacation 2026', targetAmount: 4000, currentAmount: 3100, deadline: '2026-11-01', category: 'Entertainment & Leisure', notes: 'Flight and ryokan stays.' },
    ],
    notifications: [
      { title: 'AI Investment Tip', message: 'You have surplus cash flow this month. Consider allocating ₹400 to your High-Yield account.', type: 'info', date: '2026-07-17' },
    ],
  },
  family: {
    transactions: [
      { title: 'Combined Household Income', amount: 8200, type: 'income', category: 'Salary & Allowance', date: '2026-07-01', paymentMethod: 'Bank Transfer' },
      { title: 'Mortgage Payment', amount: 2100, type: 'expense', category: 'Housing & Rent', date: '2026-07-01', paymentMethod: 'Bank Auto-Pay', isEssential: true },
      { title: 'Weekly Family Groceries', amount: 920, type: 'expense', category: 'Groceries & Dining', date: '2026-07-05', paymentMethod: 'Debit Card', isEssential: true },
      { title: 'Daycare & After-School', amount: 650, type: 'expense', category: 'Childcare & Family', date: '2026-07-03', paymentMethod: 'Bank Transfer', isEssential: true },
      { title: 'Electricity, Gas & Water', amount: 280, type: 'expense', category: 'Utilities & Bills', date: '2026-07-08', paymentMethod: 'Bank Auto-Pay', isEssential: true },
      { title: 'Kids Soccer & Activities', amount: 160, type: 'expense', category: 'Entertainment & Leisure', date: '2026-07-12', paymentMethod: 'Credit Card', isEssential: false },
      { title: 'Family SUV Fuel', amount: 240, type: 'expense', category: 'Transport & Fuel', date: '2026-07-14', paymentMethod: 'Credit Card', isEssential: true },
      { title: 'Pediatric Checkup Co-pay', amount: 95, type: 'expense', category: 'Healthcare & Medical', date: '2026-07-16', paymentMethod: 'Debit Card', isEssential: true },
    ],
    budgets: [
      { category: 'Housing & Rent', limit: 2200 },
      { category: 'Groceries & Dining', limit: 1000 },
      { category: 'Childcare & Family', limit: 700 },
      { category: 'Utilities & Bills', limit: 350 },
      { category: 'Transport & Fuel', limit: 300 },
    ],
    goals: [
      { title: 'Kids College Fund', targetAmount: 25000, currentAmount: 8400, deadline: '2032-01-01', category: 'Investments & Savings', notes: '529 plan contributions.' },
      { title: 'Family Road Trip', targetAmount: 2500, currentAmount: 1100, deadline: '2026-12-15', category: 'Entertainment & Leisure' },
    ],
    notifications: [
      { title: 'Bill Reminder', message: 'Mortgage payment due in 3 days.', type: 'bill', date: '2026-07-20' },
    ],
  },
  senior: {
    transactions: [
      { title: 'Pension & Social Security', amount: 3400, type: 'income', category: 'Salary & Allowance', date: '2026-07-01', paymentMethod: 'Bank Direct Deposit' },
      { title: 'Condo HOA & Rent', amount: 1100, type: 'expense', category: 'Housing & Rent', date: '2026-07-01', paymentMethod: 'Bank Auto-Pay', isEssential: true },
      { title: 'Prescription Medications', amount: 220, type: 'expense', category: 'Healthcare & Medical', date: '2026-07-04', paymentMethod: 'Debit Card', isEssential: true },
      { title: 'Grocery Store Essentials', amount: 380, type: 'expense', category: 'Groceries & Dining', date: '2026-07-06', paymentMethod: 'Debit Card', isEssential: true },
      { title: 'Electric & Phone Bills', amount: 145, type: 'expense', category: 'Utilities & Bills', date: '2026-07-08', paymentMethod: 'Bank Auto-Pay', isEssential: true },
      { title: 'Community Center Class', amount: 40, type: 'expense', category: 'Entertainment & Leisure', date: '2026-07-12', paymentMethod: 'Cash', isEssential: false },
      { title: 'Medical Specialist Visit', amount: 85, type: 'expense', category: 'Healthcare & Medical', date: '2026-07-15', paymentMethod: 'Debit Card', isEssential: true },
    ],
    budgets: [
      { category: 'Housing & Rent', limit: 1200 },
      { category: 'Healthcare & Medical', limit: 400 },
      { category: 'Groceries & Dining', limit: 450 },
      { category: 'Utilities & Bills', limit: 200 },
      { category: 'Entertainment & Leisure', limit: 100 },
    ],
    goals: [
      { title: 'Emergency Medical Buffer', targetAmount: 5000, currentAmount: 3200, deadline: '2026-12-31', category: 'Healthcare & Medical', notes: 'Keep fixed income safe.' },
    ],
    notifications: [
      { title: 'Monthly Summary Ready', message: 'Your simplified monthly review is available on the dashboard.', type: 'info', date: '2026-07-20' },
    ],
  },
};

/** Seed demo finance data for a user (used by demo login / reset). */
export async function seedPersonaData(userId: string | Types.ObjectId, persona: UserPersona) {
  const uid = new Types.ObjectId(userId.toString());
  await clearUserFinanceData(uid);

  const seed = PERSONA_SEEDS[persona] || PERSONA_SEEDS.professional;

  await Transaction.insertMany(
    seed.transactions.map((t) => ({ ...t, userId: uid }))
  );
  await Budget.insertMany(
    seed.budgets.map((b) => ({
      ...b,
      userId: uid,
      color: CATEGORY_COLORS[b.category] || '#64748B',
    }))
  );
  await Goal.insertMany(seed.goals.map((g) => ({ ...g, userId: uid })));
  await Notification.insertMany(
    seed.notifications.map((n) => ({ ...n, userId: uid, read: false }))
  );
}

/** Wipe all finance docs for a user — used for fresh real accounts. */
export async function clearUserFinanceData(userId: string | Types.ObjectId) {
  const uid = new Types.ObjectId(userId.toString());
  await Promise.all([
    Transaction.deleteMany({ userId: uid }),
    Budget.deleteMany({ userId: uid }),
    Goal.deleteMany({ userId: uid }),
    Notification.deleteMany({ userId: uid }),
  ]);
}

/** True when the user's ledger is only the hardcoded persona demo pack. */
export async function hasOnlyPersonaSeedData(userId: string | Types.ObjectId) {
  const uid = new Types.ObjectId(userId.toString());
  const txs = await Transaction.find({ userId: uid }).select('title').lean();
  if (txs.length === 0) return false;
  const demoTitles = new Set(
    Object.values(PERSONA_SEEDS).flatMap((s) => s.transactions.map((t) => t.title))
  );
  return txs.every((t) => demoTitles.has(t.title));
}

export { CATEGORY_COLORS };
