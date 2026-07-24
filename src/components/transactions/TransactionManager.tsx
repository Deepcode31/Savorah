import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { Transaction } from '../../types';
import { CATEGORY_COLORS } from '../../data/initialData';
import { SmartTransactionModal } from './SmartTransactionModal';
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
  IndianRupee,
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
  const { transactions, deleteTransaction } = useFinance();
  const { currentUser } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(isAddModalOpenInitially);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

  const handleOpenAdd = () => {
    setEditingTx(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (onCloseAddModal) onCloseAddModal();
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
      <div className="p-4 sm:p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs min-w-[580px]">
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
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
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

      {/* Smart Transaction Import Hub Modal */}
      <SmartTransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingTx={editingTx}
      />
    </div>
  );
};
