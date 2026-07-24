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
  onboardingComplete?: boolean;
}

export type TransactionType = 'expense' | 'income';

export interface SplitParticipant {
  id: string;
  name: string;
  amount: number;
  /** True when this person is you (the logged-in user). */
  isMe?: boolean;
  /** Friend has settled their share with you. */
  settled?: boolean;
}

export interface SplitInfo {
  totalAmount: number;
  /** You paid the full bill; friends owe you their shares. */
  paidByMe: boolean;
  participants: SplitParticipant[];
}

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
  split?: SplitInfo;
}

export interface Friend {
  id: string;
  name: string;
  color: string;
}

export interface BudgetLimit {
  category: string;
  limit: number;
  spent: number;
  color: string;
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
