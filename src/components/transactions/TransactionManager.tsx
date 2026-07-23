import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { Transaction, TransactionType } from '../../types';
import { CATEGORY_COLORS } from '../../data/initialData';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Sparkles,
  CheckCircle2,
  X,
  Upload,
  DollarSign,
  Tag,
  Calendar,
  CreditCard,
  FileText,
} from 'lucide-react';

interface TransactionManagerProps {
  isAddModalOpenInitially?: boolean;
  onCloseAddModal?: () => void;
}

export const TransactionManager: React.FC<TransactionManagerProps> = ({
  isAddModalOpenInitially = false,
  onCloseAddModal,
}) => {
  const { transactions, addTransaction, editTransaction, deleteTransaction } = useFinance();
  const { currentUser } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(isAddModalOpenInitially);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('Groceries & Dining');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [notes, setNotes] = useState('');
  const [isEssential, setIsEssential] = useState(true);
  const [tagsInput, setTagsInput] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');

  const [aiAutoCategorizing, setAiAutoCategorizing] = useState(false);
  const [aiInsight, setAiInsight] = useState('');

  const handleOpenAdd = () => {
    setEditingTx(null);
    setTitle('');
    setAmount('');
    setType('expense');
    setCategory('Groceries & Dining');
    setDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('Credit Card');
    setNotes('');
    setIsEssential(true);
    setTagsInput('');
    setReceiptUrl('');
    setAiInsight('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setTitle(tx.title);
    setAmount(tx.amount.toString());
    setType(tx.type);
    setCategory(tx.category);
    setDate(tx.date);
    setPaymentMethod(tx.paymentMethod);
    setNotes(tx.notes || '');
    setIsEssential(tx.isEssential ?? true);
    setTagsInput((tx.tags || []).join(', '));
    setReceiptUrl(tx.receiptUrl || '');
    setAiInsight('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (onCloseAddModal) onCloseAddModal();
  };

  // AI Smart Auto-categorization
  const handleAICategorize = async () => {
    if (!title.trim()) return;
    setAiAutoCategorizing(true);
    try {
      const res = await fetch('/api/gemini/auto-categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          amount: Number(amount) || 50,
          persona: currentUser?.persona || 'professional',
        }),
      });
      const data = await res.json();
      if (data.category) setCategory(data.category);
      if (typeof data.isEssential === 'boolean') setIsEssential(data.isEssential);
      if (data.tags && Array.isArray(data.tags)) setTagsInput(data.tags.join(', '));
      if (data.insight) setAiInsight(data.insight);
    } catch (e) {
      console.error(e);
    } finally {
      setAiAutoCategorizing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    const tagsArr = tagsInput
      ? tagsInput.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const payload = {
      title,
      amount: Number(amount) || 0,
      type,
      category,
      date,
      paymentMethod,
      notes,
      isEssential,
      tags: tagsArr,
      receiptUrl: receiptUrl || undefined,
    };

    if (editingTx) {
      editTransaction(editingTx.id, payload);
    } else {
      addTransaction(payload);
    }

    handleCloseModal();
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.notes && tx.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || tx.category === selectedCategory;
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;

    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Transaction Manager
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Log, categorize, and track daily income and expenses seamlessly.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Type Filter */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === 'all' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === 'income' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === 'expense' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500'
              }`}
            >
              Expense
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Categories</option>
            {CATEGORY_COLORS.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-bold">Transaction</th>
                <th className="pb-3 font-bold">Category</th>
                <th className="pb-3 font-bold">Date</th>
                <th className="pb-3 font-bold">Payment</th>
                <th className="pb-3 font-bold text-right">Amount</th>
                <th className="pb-3 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No transactions match your search filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3.5 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            tx.type === 'income' ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        <div>
                          <div>{tx.title}</div>
                          {tx.notes && (
                            <div className="text-[10px] font-normal text-slate-400">
                              {tx.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 text-slate-600 font-medium">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        {tx.category}
                      </span>
                    </td>

                    <td className="py-3.5 text-slate-500 font-medium">{tx.date}</td>
                    <td className="py-3.5 text-slate-500 font-medium">{tx.paymentMethod}</td>

                    <td
                      className={`py-3.5 text-right font-black ${
                        tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </td>

                    <td className="py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(tx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                          title="Edit transaction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-500/20 shadow-2xl p-6 md:p-8">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-1">
              {editingTx ? 'Edit Transaction' : 'Log New Transaction'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter financial details or use AI Auto-Categorization.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Type Switcher */}
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    type === 'expense' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Expense Outflow
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    type === 'income' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Income Inflow
                </button>
              </div>

              {/* Title & AI Auto-Categorize Button */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Title / Description
                </label>
                <div className="relative flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Organic Groceries or Part-time tutoring"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleAICategorize}
                    disabled={aiAutoCategorizing || !title.trim()}
                    className="py-2 px-3 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-all"
                    title="Auto detect category and tags with Gemini AI"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    {aiAutoCategorizing ? 'AI...' : 'Auto-Tag'}
                  </button>
                </div>
                {aiInsight && (
                  <p className="text-[11px] text-emerald-700 mt-1 font-medium italic">
                    AI Note: {aiInsight}
                  </p>
                )}
              </div>

              {/* Amount & Category */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  >
                    {CATEGORY_COLORS.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date & Payment Method */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI / Cash">UPI / Cash</option>
                    <option value="PayPal">PayPal</option>
                  </select>
                </div>
              </div>

              {/* Essential toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isEssential"
                  checked={isEssential}
                  onChange={(e) => setIsEssential(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isEssential" className="text-xs font-semibold text-slate-700">
                  Mark as Essential Cost (Housing, Groceries, Healthcare, Utilities)
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
              >
                {editingTx ? 'Save Changes' : 'Save Transaction'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
