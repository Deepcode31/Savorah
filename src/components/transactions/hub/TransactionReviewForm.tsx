import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Receipt, MessageSquare, FileSpreadsheet, Edit3 } from 'lucide-react';
import { ExtractedTransaction } from '../../../services/transactionImportServices';
import { ConfidenceBadge } from './ConfidenceBadge';
import { CATEGORY_COLORS } from '../../../data/initialData';
import { TransactionType } from '../../../types';

const SOURCE_META = {
  receipt: { icon: Receipt, label: 'Receipt Scan', color: 'text-violet-300 bg-violet-400/15 border-violet-400/25' },
  sms: { icon: MessageSquare, label: 'SMS Parse', color: 'text-blue-300 bg-blue-400/15 border-blue-400/25' },
  statement: { icon: FileSpreadsheet, label: 'Bank Statement', color: 'text-amber-300 bg-amber-400/15 border-amber-400/25' },
  manual: { icon: Edit3, label: 'Manual Entry', color: 'text-mist-300 bg-white/8 border-white/10' },
};

interface TransactionReviewFormProps {
  extracted: ExtractedTransaction;
  isDuplicate?: boolean;
  onSave: (tx: ExtractedTransaction) => void;
  onBack: () => void;
}

export const TransactionReviewForm: React.FC<TransactionReviewFormProps> = ({
  extracted,
  isDuplicate,
  onSave,
  onBack,
}) => {
  const [form, setForm] = React.useState<ExtractedTransaction>({ ...extracted });

  const set = (key: keyof ExtractedTransaction, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const srcMeta = SOURCE_META[form.source] || SOURCE_META.manual;
  const SrcIcon = srcMeta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-4"
    >
      {/* Header row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold ${srcMeta.color}`}>
          <SrcIcon className="w-3 h-3" />
          {srcMeta.label}
        </span>
        <ConfidenceBadge score={form.confidence} />
      </div>

      {/* Duplicate warning */}
      {isDuplicate && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-400/10 border border-amber-400/25"
        >
          <AlertTriangle className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-amber-300">Possible duplicate detected</p>
            <p className="text-[11px] text-amber-300 mt-0.5">
              A similar transaction already exists. You can still save it or go back.
            </p>
          </div>
        </motion.div>
      )}

      {/* Type switcher */}
      <div className="flex rounded-xl bg-white/8 p-1 border border-white/10">
        <button
          type="button"
          onClick={() => set('type', 'expense')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            form.type === 'expense' ? 'bg-rose-500/100 text-white shadow-sm' : 'text-mist-500'
          }`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => set('type', 'income')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            form.type === 'income' ? 'bg-emerald-600 text-white shadow-sm' : 'text-mist-500'
          }`}
        >
          Income
        </button>
      </div>

      {/* Extracted fields — editable cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Merchant */}
        <div className="col-span-2">
          <label className="block text-[10px] font-bold text-mist-500 uppercase tracking-wide mb-1">
            Merchant / Description
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-mist-100 focus:outline-none focus:border-emerald-400/60 focus:ring-1 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-[10px] font-bold text-mist-500 uppercase tracking-wide mb-1">Amount</label>
          <input
            type="number"
            step="0.01"
            value={form.amount}
            onChange={(e) => set('amount', parseFloat(e.target.value) || 0)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-mist-100 focus:outline-none focus:border-emerald-400/60 focus:ring-1 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-[10px] font-bold text-mist-500 uppercase tracking-wide mb-1">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-mist-100 focus:outline-none focus:border-emerald-400/60 focus:ring-1 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-[10px] font-bold text-mist-500 uppercase tracking-wide mb-1">Category</label>
          <select
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-mist-100 focus:outline-none focus:border-emerald-400/60 transition-all"
          >
            {CATEGORY_COLORS.map((c) => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Payment method */}
        <div>
          <label className="block text-[10px] font-bold text-mist-500 uppercase tracking-wide mb-1">Payment</label>
          <select
            value={form.paymentMethod}
            onChange={(e) => set('paymentMethod', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-mist-100 focus:outline-none focus:border-emerald-400/60 transition-all"
          >
            <option>Credit Card</option>
            <option>Debit Card</option>
            <option>Bank Transfer</option>
            <option>UPI / Cash</option>
            <option>PayPal</option>
          </select>
        </div>

        {/* Notes */}
        <div className="col-span-2">
          <label className="block text-[10px] font-bold text-mist-500 uppercase tracking-wide mb-1">Notes (optional)</label>
          <input
            type="text"
            value={form.notes || ''}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Any additional notes…"
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-mist-100 focus:outline-none focus:border-emerald-400/60 transition-all"
          />
        </div>
      </div>

      {/* Essential toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.isEssential ?? false}
          onChange={(e) => set('isEssential', e.target.checked)}
          className="rounded text-emerald-300 focus:ring-emerald-500"
        />
        <span className="text-xs font-semibold text-mist-300">Mark as Essential Cost</span>
      </label>

      {/* Tags */}
      {form.tags && form.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {form.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 rounded-lg bg-white/8 text-[10px] font-semibold text-mist-300">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-2.5 px-4 rounded-xl bg-white/8 hover:bg-white/12 text-mist-300 font-bold text-xs transition-all"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={() => onSave(form)}
          className="flex-[2] py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
        >
          Save Transaction
        </button>
      </div>
    </motion.div>
  );
};
