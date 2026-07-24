import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, BudgetLimit, SavingsGoal, NotificationItem } from '../types';
import { useAuth } from './AuthContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

interface FinanceContextType {
  transactions: Transaction[];
  budgets: BudgetLimit[];
  goals: SavingsGoal[];
  notifications: NotificationItem[];
  loading: boolean;
  refreshFinance: () => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  editTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateBudgetLimit: (category: string, newLimit: number) => Promise<void>;
  setBudgetsBulk: (budgets: Array<{ category: string; limit: number; color?: string }>) => Promise<void>;
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => Promise<void>;
  contributeToGoal: (id: string, amount: number) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'date' | 'read'>) => Promise<void>;
  resetToDemoData: () => Promise<void>;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  essentialExpenseTotal: number;
  nonEssentialExpenseTotal: number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<BudgetLimit[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshFinance = useCallback(async () => {
    if (!currentUser) {
      setTransactions([]);
      setBudgets([]);
      setGoals([]);
      setNotifications([]);
      return;
    }
    setLoading(true);
    try {
      const [txRes, budRes, goalRes, notifRes] = await Promise.all([
        api<{ transactions: Transaction[] }>('/api/transactions'),
        api<{ budgets: BudgetLimit[] }>('/api/budgets'),
        api<{ goals: SavingsGoal[] }>('/api/goals'),
        api<{ notifications: NotificationItem[] }>('/api/notifications'),
      ]);
      setTransactions(txRes.transactions || []);
      setBudgets(budRes.budgets || []);
      setGoals(goalRes.goals || []);
      setNotifications(notifRes.notifications || []);
    } catch (e) {
      console.error('Failed to load finance data:', e);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, currentUser?.onboardingComplete, currentUser?.persona, currentUser?.monthlyIncome]);

  useEffect(() => {
    refreshFinance();
  }, [refreshFinance]);

  const totalIncome = useMemo(() => {
    const txIncome = transactions.filter((t) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    return txIncome > 0 ? txIncome : currentUser?.monthlyIncome || 0;
  }, [transactions, currentUser]);

  const totalExpense = useMemo(() => {
    return transactions.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const essentialExpenseTotal = useMemo(() => {
    return transactions
      .filter(
        (t) =>
          t.type === 'expense' &&
          (t.isEssential ||
            t.category === 'Housing & Rent' ||
            t.category === 'Groceries & Dining' ||
            t.category === 'Healthcare & Medical')
      )
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const nonEssentialExpenseTotal = useMemo(() => totalExpense - essentialExpenseTotal, [
    totalExpense,
    essentialExpenseTotal,
  ]);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    const data = await api<{ transaction: Transaction }>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(tx),
    });
    setTransactions((prev) => [data.transaction, ...prev]);
    // Refresh budgets (spent) + notifications (budget exceeded)
    const [budRes, notifRes] = await Promise.all([
      api<{ budgets: BudgetLimit[] }>('/api/budgets'),
      api<{ notifications: NotificationItem[] }>('/api/notifications'),
    ]);
    setBudgets(budRes.budgets || []);
    setNotifications(notifRes.notifications || []);
  };

  const editTransaction = async (id: string, updates: Partial<Transaction>) => {
    const data = await api<{ transaction: Transaction }>(`/api/transactions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    setTransactions((prev) => prev.map((t) => (t.id === id ? data.transaction : t)));
    const budRes = await api<{ budgets: BudgetLimit[] }>('/api/budgets');
    setBudgets(budRes.budgets || []);
  };

  const deleteTransaction = async (id: string) => {
    await api(`/api/transactions/${id}`, { method: 'DELETE' });
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    const budRes = await api<{ budgets: BudgetLimit[] }>('/api/budgets');
    setBudgets(budRes.budgets || []);
  };

  const updateBudgetLimit = async (category: string, newLimit: number) => {
    const data = await api<{ budget: BudgetLimit }>(
      `/api/budgets/${encodeURIComponent(category)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ limit: Math.max(10, newLimit) }),
      }
    );
    setBudgets((prev) => {
      const exists = prev.some((b) => b.category === category);
      if (exists) return prev.map((b) => (b.category === category ? data.budget : b));
      return [...prev, data.budget];
    });
  };

  const setBudgetsBulk = async (
    items: Array<{ category: string; limit: number; color?: string }>
  ) => {
    const data = await api<{ budgets: BudgetLimit[] }>('/api/budgets', {
      method: 'PUT',
      body: JSON.stringify({ budgets: items }),
    });
    setBudgets(data.budgets || []);
  };

  const addGoal = async (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    const data = await api<{ goal: SavingsGoal }>('/api/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    });
    setGoals((prev) => [data.goal, ...prev]);
  };

  const contributeToGoal = async (id: string, amount: number) => {
    const data = await api<{ goal: SavingsGoal; achieved?: boolean }>(`/api/goals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ contribute: amount }),
    });
    setGoals((prev) => prev.map((g) => (g.id === id ? data.goal : g)));
    if (data.achieved) {
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch (e) {
        console.error(e);
      }
      const notifRes = await api<{ notifications: NotificationItem[] }>('/api/notifications');
      setNotifications(notifRes.notifications || []);
    }
  };

  const deleteGoal = async (id: string) => {
    await api(`/api/goals/${id}`, { method: 'DELETE' });
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const markNotificationRead = async (id: string) => {
    await api(`/api/notifications/${id}/read`, { method: 'PATCH' });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = async () => {
    await api('/api/notifications', { method: 'DELETE' });
    setNotifications([]);
  };

  const addNotification = async (notif: Omit<NotificationItem, 'id' | 'date' | 'read'>) => {
    const data = await api<{ notification: NotificationItem }>('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(notif),
    });
    setNotifications((prev) => [data.notification, ...prev]);
  };

  const resetToDemoData = async () => {
    await api('/api/users/me/reset-demo', { method: 'POST' });
    await refreshFinance();
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgets,
        goals,
        notifications,
        loading,
        refreshFinance,
        addTransaction,
        editTransaction,
        deleteTransaction,
        updateBudgetLimit,
        setBudgetsBulk,
        addGoal,
        contributeToGoal,
        deleteGoal,
        markNotificationRead,
        clearAllNotifications,
        addNotification,
        resetToDemoData,
        totalIncome,
        totalExpense,
        netSavings,
        savingsRate,
        essentialExpenseTotal,
        nonEssentialExpenseTotal,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
