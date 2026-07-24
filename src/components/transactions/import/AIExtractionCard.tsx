import React, { useState } from 'react';
import { ExtractedTransactionData } from '../../../services/smsParser';
import { ConfidenceBadge } from './ConfidenceBadge';
import { CATEGORY_COLORS } from '../../../data/initialData';
import {
  Sparkles,
  Check,
  Tag,
  Calendar,
  CreditCard,
  IndianRupee,
  FileText,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { DuplicateCheckResult } from '../../../services/duplicateChecker';

interface AIExtractionCardProps {
  extractedData: ExtractedTransactionData;
  duplicateCheck?: DuplicateCheckResult;
  onSave: (data: ExtractedTransactionData) => void;
  onReset?: () => void;
  isLoading?: boolean;
}

export const AIExtractionCard: React.FC<AIExtractionCardProps> = ({
  extractedData,
  duplicateCheck,
  onSave,
  onReset,
  isLoading = false,
}) => {
  const [title, setTitle] = useState(extractedData.title);
  const [amount, setAmount] = useState(extractedData.amount.toString());
  const [type, setType] = useState(extractedData.type);
  const [category, setCategory] = useState(extractedData.category);
  const [date, setDate] = useState(extractedData.date);
  const [paymentMethod, setPaymentMethod] = useState(extractedData.paymentMethod);
  const [isEssential, setIsEssential] = useState(extractedData.isEssential);
  const [notes, setNotes] = useState(extractedData.notes || '');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...extractedData,
      title,
      amount: parseFloat(amount) || 0,
      type,
      category,
      date,
      paymentMethod,
      isEssential,
      notes,
    });
  };

  return (
    <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-500/20 shadow-xl p-5 md:p-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 font-bold">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              AI Extracted Transaction
            </h4>
            <p className="text-[11px] text-slate-500">
              Source: <span className="font-bold text-slate-700 capitalize">{extractedData.source} Import</span>
            </p>
          </div>
        </div>

        <ConfidenceBadge score={extractedData.confidenceScore} />
      </div>

      {/* Duplicate Warning Banner */}
      {duplicateCheck?.isDuplicate && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Duplicate Transaction Warning</p>
            <p className="text-[11px] text-amber-800/90 mt-0.5">
              {duplicateCheck.reason}
            </p>
          </div>
        </div>
      )}

      {/* Editable Form */}
      <form onSubmit={handleFormSubmit} className="space-y-3.5">
        {/* Type Switcher */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              type === 'expense' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Expense Outflow
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              type === 'income' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Income Inflow
          </button>
        </div>

        {/* Merchant / Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Merchant / Description
          </label>
          <div className="relative">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
        </div>

        {/* Amount & Category */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Amount (₹)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-extrabold text-slate-900 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Predicted Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
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
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
            >
              <option value="UPI / Cash">UPI / Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="PayPal">PayPal</option>
            </select>
          </div>
        </div>

        {/* Essential Toggle */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="aiCardEssential"
            checked={isEssential}
            onChange={(e) => setIsEssential(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-emerald-500"
          />
          <label htmlFor="aiCardEssential" className="text-xs font-semibold text-slate-700">
            Mark as Essential Living Cost
          </label>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 pt-2">
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Re-scan
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all"
          >
            <Check className="w-4 h-4" />
            {duplicateCheck?.isDuplicate ? 'Save Anyway' : 'Confirm & Save Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
};
