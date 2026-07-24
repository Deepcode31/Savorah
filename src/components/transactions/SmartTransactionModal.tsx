import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType } from '../../types';
import { CATEGORY_COLORS } from '../../data/initialData';
import { TransactionMethodSelector, ImportMethod } from './import/TransactionMethodSelector';
import { ReceiptUploader } from './import/ReceiptUploader';
import { StatementImporter } from './import/StatementImporter';
import { SMSParser } from './import/SMSParser';
import { ExtractedTransactionData } from '../../services/smsParser';
import { ExtractedStatementRow } from '../../services/statementParser';
import { checkDuplicateTransaction, DuplicateCheckResult } from '../../services/duplicateChecker';
import {
  X,
  Sparkles,
  Plus,
  Check,
  AlertTriangle,
  IndianRupee,
  Tag,
  Calendar,
  CreditCard,
  FileText,
} from 'lucide-react';

interface SmartTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTx?: Transaction | null;
}

export const SmartTransactionModal: React.FC<SmartTransactionModalProps> = ({
  isOpen,
  onClose,
  editingTx,
}) => {
  const { transactions, addTransaction, editTransaction } = useFinance();
  const [activeMethod, setActiveMethod] = useState<ImportMethod>('manual');

  // Manual Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('Groceries & Dining');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [notes, setNotes] = useState('');
  const [isEssential, setIsEssential] = useState(true);
  const [tagsInput, setTagsInput] = useState('');
  const [aiAutoCategorizing, setAiAutoCategorizing] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateCheckResult | null>(null);

  useEffect(() => {
    if (editingTx) {
      setTitle(editingTx.title);
      setAmount(editingTx.amount.toString());
      setType(editingTx.type);
      setCategory(editingTx.category);
      setDate(editingTx.date);
      setPaymentMethod(editingTx.paymentMethod);
      setNotes(editingTx.notes || '');
      setIsEssential(editingTx.isEssential ?? true);
      setTagsInput((editingTx.tags || []).join(', '));
      setActiveMethod('manual');
    } else {
      resetManualForm();
    }
  }, [editingTx, isOpen]);

  const resetManualForm = () => {
    setTitle('');
    setAmount('');
    setType('expense');
    setCategory('Groceries & Dining');
    setDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('Credit Card');
    setNotes('');
    setIsEssential(true);
    setTagsInput('');
    setAiInsight('');
    setDuplicateWarning(null);
  };

  if (!isOpen) return null;

  // Handle AI Auto-Categorize for manual title
  const handleAICategorize = async () => {
    if (!title.trim()) return;
    setAiAutoCategorizing(true);
    try {
      const res = await fetch('/api/gemini/auto-categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, amount: parseFloat(amount) || 100 }),
      });
      const data = await res.json();
      if (data.category) setCategory(data.category);
      if (data.tags && Array.isArray(data.tags)) setTagsInput(data.tags.join(', '));
      if (data.aiNote) setAiInsight(data.aiNote);
    } catch {
      // Fallback local heuristic
      if (title.toLowerCase().includes('swiggy')) setCategory('Food & Dining');
      else if (title.toLowerCase().includes('uber')) setCategory('Transport & Fuel');
      else if (title.toLowerCase().includes('amazon')) setCategory('Shopping & Lifestyle');
    } finally {
      setAiAutoCategorizing(false);
    }
  };

  // Duplicate check on manual input blur
  const handleTitleBlur = () => {
    if (title && amount) {
      const dup = checkDuplicateTransaction(
        { title, amount: parseFloat(amount) || 0, date, type },
        transactions
      );
      setDuplicateWarning(dup.isDuplicate ? dup : null);
    }
  };

  // Submit manual transaction
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    const parsedTags = tagsInput
      ? tagsInput.split(',').map((t) => t.trim()).filter((t) => t.length > 0)
      : [];

    if (editingTx) {
      editTransaction({
        ...editingTx,
        title,
        amount: parseFloat(amount) || 0,
        type,
        category,
        date,
        paymentMethod,
        notes,
        isEssential,
        tags: parsedTags,
      });
    } else {
      addTransaction({
        title,
        amount: parseFloat(amount) || 0,
        type,
        category,
        date,
        paymentMethod,
        notes,
        isEssential,
        tags: parsedTags,
      });
    }

    onClose();
  };

  // Save transaction extracted from Receipt / SMS
  const handleExtractedSave = (data: ExtractedTransactionData) => {
    addTransaction({
      title: data.title,
      amount: data.amount,
      type: data.type,
      category: data.category,
      date: data.date,
      paymentMethod: data.paymentMethod,
      notes: data.notes || `Imported via ${data.source}`,
      isEssential: data.isEssential,
      tags: data.tags || ['AI Import'],
    });
    onClose();
  };

  // Save batch transactions from Bank Statement
  const handleBatchImport = (selectedRows: ExtractedStatementRow[]) => {
    selectedRows.forEach((row) => {
      addTransaction({
        title: row.description,
        amount: row.amount,
        type: row.type,
        category: row.category,
        date: row.date,
        paymentMethod: row.paymentMethod,
        notes: `Imported from Bank Statement`,
        isEssential: row.isEssential,
        tags: ['Statement Import'],
      });
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl my-auto overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-500/20 shadow-2xl p-5 md:p-7 max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-slate-900">
              {editingTx ? 'Edit Transaction' : 'Smart Transaction Hub'}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" /> AI Powered
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Choose an input channel: Manual form, Scan Bank Receipt, Import Bank Statement, or Paste Payment SMS.
          </p>
        </div>

        {/* Method Selector Tabs */}
        {!editingTx && (
          <TransactionMethodSelector
            activeMethod={activeMethod}
            onMethodChange={(method) => {
              setActiveMethod(method);
              setDuplicateWarning(null);
            }}
          />
        )}

        {/* Content Views */}
        <div className="overflow-y-auto pr-1 flex-1">
          {/* 1. MANUAL ENTRY */}
          {activeMethod === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-3.5">
              {duplicateWarning?.isDuplicate && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Duplicate Transaction Detected:</span>{' '}
                    {duplicateWarning.reason}
                  </div>
                </div>
              )}

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

              {/* Title & AI Auto-Tag */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Title / Merchant Description
                </label>
                <div className="relative flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Swiggy Gourmet or Reliance Fresh"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleAICategorize}
                    disabled={aiAutoCategorizing || !title.trim()}
                    className="py-2 px-3 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-all"
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
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    onBlur={handleTitleBlur}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-extrabold text-slate-900 focus:outline-none focus:border-emerald-500"
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
              <div className="grid grid-cols-2 gap-2.5">
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
                    <option value="UPI / Cash">UPI / Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="PayPal">PayPal</option>
                  </select>
                </div>
              </div>

              {/* Tags & Notes */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Custom Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Work, Lunch, Travel"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                  <input
                    type="text"
                    placeholder="Additional context or invoice ref"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Essential Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="modalIsEssential"
                  checked={isEssential}
                  onChange={(e) => setIsEssential(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="modalIsEssential" className="text-xs font-semibold text-slate-700">
                  Mark as Essential Living Cost (Housing, Groceries, Utilities, Healthcare)
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                {editingTx ? 'Save Changes' : 'Save Transaction'}
              </button>
            </form>
          )}

          {/* 2. RECEIPT SCAN */}
          {activeMethod === 'receipt' && (
            <ReceiptUploader onTransactionExtracted={handleExtractedSave} />
          )}

          {/* 3. STATEMENT IMPORT */}
          {activeMethod === 'statement' && (
            <StatementImporter onBatchImport={handleBatchImport} />
          )}

          {/* 4. SMS PASTE */}
          {activeMethod === 'sms' && (
            <SMSParser onTransactionExtracted={handleExtractedSave} />
          )}
        </div>
      </div>
    </div>
  );
};
