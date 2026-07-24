export type UserPersona = 'student' | 'professional' | 'family' | 'senior';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  persona: UserPersona;
  monthlyIncome: number;
  currency: string;
  isLoggedIn: boolean;
  isGoogleUser?: boolean;
}

export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  paymentMethod: string;
  notes?: string;
  receiptUrl?: string;
  isEssential?: boolean;
  tags?: string[];
}

export interface BudgetLimit {
  category: string;
  limit: number;
  spent: number;
  color: string;
}

export interface GoalContribution {
  id: string;
  amount: number;
  date: string;
  note?: string;
  type?: 'scheduled' | 'one-time' | 'bonus';
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  imageUrl?: string;
  notes?: string;
  icon?: string;
  monthlyContribution?: number;
  expectedReturnRate?: number; // e.g. 8 for 8% annual
  priority?: 'high' | 'medium' | 'low';
  riskLevel?: 'low' | 'medium' | 'high';
  color?: string;
  history?: GoalContribution[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success' | 'bill';
  date: string;
  read: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  thinkingProcess?: string;
  groundingUrls?: Array<{ title: string; uri: string }>;
  isThinking?: boolean;
}

export interface CategoryColor {
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
}
