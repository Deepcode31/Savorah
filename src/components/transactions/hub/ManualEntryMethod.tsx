import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { CATEGORY_COLORS } from '../../../data/initialData';
import { Transaction, TransactionType } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

interface ManualEntryMethodProps {
  editingTx?: Transaction | null;
  prefill?: Partial<Transaction>;
  onSave: (payload: Omit<Transaction, 'id'>) => void;
  onCancel: () => void;
}

const PAYMENT_METHODS = ['Credit Card', 'Debit Card', 'Bank Transfer', 'UPI / Cash', 'PayPal'];

export const ManualEntryMethod: React.FC<ManualEntryMethodProps> = ({
  editingTx,
  prefill,
  onSave,
  onCancel,
}) => {
  const { currentUser } = useAuth();

  const init = editingTx ?? prefill;
  const [title, setTitle] = useState(init?.title ?? '');
  const [amount, setAmount] = useState(init?.amount?.toString() ?? '');
  const [type, setType] = useState<TransactionType>(init?.type ?? 'expense');
  const [category, setCategory] = useState(init?.category ?? 'Groceries & Dining');
  const [date, setDate] = useState(init?.date ?? new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState(init?.paymentMethod ?? 'Credit Card');
  const [notes, setNotes] = useState(init?.notes ?? '');
  const [isEssential, setIsEssential] = useState(init?.isEssential ?? true);
  const [tagsInput, setTagsInput] = useState((init?.tags ?? []).join(', '));

  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  const [aiTagged, setAiTagged] = useState(false);

  const handleAutoTag = async () => {
    if (!title.trim()) return;
    setAiLoading(true);
    setAiTagged(false);
    try {
      const res = await fetch('/api/ai/auto-categorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('savorah_token')
            ? { Authorization: `Bearer ${localStorage.getItem('savorah_token')}` }
            : {}),
        },
        body: JSON.stringify({ title, amount: Number(amount) || 50, persona: currentUser?.persona || 'professional' }),
      });
      const data = await res.json();
      if (data.category) setCategory(data.category);
      if (typeof data.isEssential === 'boolean') setIsEssential(data.isEssential);
      if (Array.isArray(data.tags)) setTagsInput(data.tags.join(', '));
      if (data.insight) setAiInsight(data.insight);
      setAiTagged(true);
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;
    const tags = tagsInput ? tagsInput.split(',').map((s) => s.trim()).filter(Boolean) : [];
    onSave({ title, amount: Number(amount), type, category, date, paymentMethod, notes, isEssential, tags });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-3.5"
    >
      {/* Income / Expense toggle */}
      <div className="flex rounded-xl bg-white/8 p-1 border border-white/10">
        <button
          type="button"
          onClick={() => setType('expense')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            type === 'expense' ? 'bg-rose-500/100 text-white shadow-sm' : 'text-mist-500 hover:text-mist-100'
          }`}
        >
          Expense Outflow
        </button>
        <button
          type="button"
          onClick={() => setType('income')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            type === 'income' ? 'bg-emerald-600 text-white shadow-sm' : 'text-mist-500 hover:text-mist-100'
          }`}
        >
          Income Inflow
        </button>
      </div>

      {/* Title + Auto-Tag */}
      <div>
        <label className="block text-xs font-semibold text-mist-300 mb-1">Title / Description</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Swiggy Dinner, Amazon Order"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setAiTagged(false); }}
            className="flex-1 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-mist-100 focus:outline-none focus:border-emerald-400/60 focus:ring-1 focus:ring-emerald-500/20 transition-all"
            required
          />
          <button
            type="button"
            onClick={handleAutoTag}
            disabled={aiLoading || !title.trim()}
            className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-all disabled:opacity-50 ${
              aiTagged ? 'bg-emerald-400/100 text-white' : 'bg-emerald-400/15 hover:bg-emerald-400/20 text-emerald-300'
            }`}
            title="Auto-categorize with Savorah AI"
          >
            {aiTagged ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5 text-emerald-300" />}
            {aiLoading ? 'AI…' : aiTagged ? 'Tagged!' : 'Auto-Tag'}
          </button>
        </div>
        {aiInsight && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] text-emerald-300 mt-1.5 font-medium italic"
          >
            💡 {aiInsight}
          </motion.p>
        )}
      </div>

      {/* Amount & Category */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-mist-300 mb-1">Amount (₹)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-mist-100 focus:outline-none focus:border-emerald-400/60 focus:ring-1 focus:ring-emerald-500/20 transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-mist-300 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-mist-100 focus:outline-none focus:border-emerald-400/60 transition-all"
          >
            {CATEGORY_COLORS.map((c) => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Date & Payment */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-mist-300 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-mist-100 focus:outline-none focus:border-emerald-400/60 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-mist-300 mb-1">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-mist-100 focus:outline-none focus:border-emerald-400/60 transition-all"
          >
            {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold text-mist-300 mb-1">Notes (optional)</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional context…"
          className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-mist-100 focus:outline-none focus:border-emerald-400/60 transition-all"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-semibold text-mist-300 mb-1">Tags (comma separated)</label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="e.g. food, delivery, weekly"
          className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-mist-100 focus:outline-none focus:border-emerald-400/60 transition-all"
        />
      </div>

      {/* Essential */}
      <label className="flex items-center gap-2 cursor-pointer pt-0.5">
        <input
          type="checkbox"
          checked={isEssential}
          onChange={(e) => setIsEssential(e.target.checked)}
          className="rounded text-emerald-300 focus:ring-emerald-500"
        />
        <span className="text-xs font-semibold text-mist-300">
          Mark as Essential Cost (Housing, Groceries, Healthcare, Utilities)
        </span>
      </label>

      {/* Buttons */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 px-4 rounded-xl bg-white/8 hover:bg-white/12 text-mist-300 font-bold text-xs transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-[2] py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
        >
          {editingTx ? 'Save Changes' : 'Save Transaction'}
        </button>
      </div>
    </motion.form>
  );
};
