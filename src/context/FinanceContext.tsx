import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Transaction, BudgetLimit, SavingsGoal, NotificationItem } from '../types';
import { INITIAL_PERSONA_DATA } from '../data/initialData';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

interface FinanceContextType {
  transactions: Transaction[];
  budgets: BudgetLimit[];
  goals: SavingsGoal[];
  notifications: NotificationItem[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  editTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  updateBudgetLimit: (category: string, newLimit: number) => void;
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
  contributeToGoal: (id: string, amount: number) => void;
  deleteGoal: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'date' | 'read'>) => void;
  resetToDemoData: () => void;
  // Computed Financial Metrics
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
  const currentPersona = currentUser?.persona || 'professional';

  // Load state per persona
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<BudgetLimit[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Initialize or re-sync when persona changes
  useEffect(() => {
    const storageKey = `savorah_data_${currentPersona}`;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTransactions(parsed.transactions || []);
        setBudgets(parsed.budgets || []);
        setGoals(parsed.goals || []);
        setNotifications(parsed.notifications || []);
        return;
      } catch (e) {
        console.error(e);
      }
    }

    // Default to mock preset for persona
    const preset = INITIAL_PERSONA_DATA[currentPersona] || INITIAL_PERSONA_DATA.professional;
    setTransactions(preset.transactions);
    setBudgets(preset.budgets);
    setGoals(preset.goals);
    setNotifications(preset.notifications);
  }, [currentPersona]);

  // Persist state when items change
  useEffect(() => {
    if (!currentPersona) return;
    const storageKey = `savorah_data_${currentPersona}`;
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        transactions,
        budgets,
        goals,
        notifications,
      })
    );
  }, [transactions, budgets, goals, notifications, currentPersona]);

  // Compute category spent dynamically based on transactions
  const updatedBudgets = useMemo(() => {
    return budgets.map((b) => {
      const spent = transactions
        .filter((t) => t.type === 'expense' && t.category === b.category)
        .reduce((acc, curr) => acc + curr.amount, 0);
      return { ...b, spent };
    });
  }, [budgets, transactions]);

  // Computed Financial Summary
  const totalIncome = useMemo(() => {
    const txIncome = transactions.filter((t) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    return txIncome > 0 ? txIncome : currentUser?.monthlyIncome || 0;
  }, [transactions, currentUser]);

  const totalExpense = useMemo(() => {
    return transactions.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const essentialExpenseTotal = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense' && (t.isEssential || t.category === 'Housing & Rent' || t.category === 'Groceries & Dining' || t.category === 'Healthcare & Medical'))
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const nonEssentialExpenseTotal = useMemo(() => {
    return totalExpense - essentialExpenseTotal;
  }, [totalExpense, essentialExpenseTotal]);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Check if adding this expense causes budget overflow
    if (tx.type === 'expense') {
      const b = budgets.find((item) => item.category === tx.category);
      if (b) {
        const currentSpent = transactions
          .filter((t) => t.type === 'expense' && t.category === tx.category)
          .reduce((acc, curr) => acc + curr.amount, 0);
        const newTotal = currentSpent + tx.amount;
        if (newTotal > b.limit) {
          addNotification({
            title: `Budget Limit Exceeded: ${tx.category}`,
            message: `Your spending in ${tx.category} ($${newTotal}) has exceeded your limit of $${b.limit}!`,
            type: 'warning',
          });
        }
      }
    }
  };

  const editTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const updateBudgetLimit = (category: string, newLimit: number) => {
    setBudgets((prev) =>
      prev.map((b) => (b.category === category ? { ...b, limit: Math.max(10, newLimit) } : b))
    );
  };

  const addGoal = (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: `sg-${Date.now()}`,
      currentAmount: 0,
    };
    setGoals((prev) => [newGoal, ...prev]);
  };

  const contributeToGoal = (id: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const updated = g.currentAmount + amount;
          if (updated >= g.targetAmount && g.currentAmount < g.targetAmount) {
            // Celebrate milestone with confetti!
            try {
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
              });
            } catch (e) {
              console.error(e);
            }
            addNotification({
              title: `🎉 Goal Achieved: ${g.title}!`,
              message: `Congratulations! You reached your savings target of $${g.targetAmount.toLocaleString()}.`,
              type: 'success',
            });
          }
          return { ...g, currentAmount: updated };
        }
        return g;
      })
    );
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const addNotification = (notif: Omit<NotificationItem, 'id' | 'date' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const resetToDemoData = () => {
    const preset = INITIAL_PERSONA_DATA[currentPersona] || INITIAL_PERSONA_DATA.professional;
    setTransactions(preset.transactions);
    setBudgets(preset.budgets);
    setGoals(preset.goals);
    setNotifications(preset.notifications);
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgets: updatedBudgets,
        goals,
        notifications,
        addTransaction,
        editTransaction,
        deleteTransaction,
        updateBudgetLimit,
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
