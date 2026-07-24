import React, { useState } from 'react';
import { CATEGORY_COLORS } from '../../data/initialData';
import { SavingsGoal } from '../../types';
import { X, Sparkles, Target, Calendar, DollarSign, Lightbulb } from 'lucide-react';

interface CreateGoalModalProps {
  onClose: () => void;
  onSubmit: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
}

export const CreateGoalModal: React.FC<CreateGoalModalProps> = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('500000');
  const [deadline, setDeadline] = useState('2027-12-31');
  const [category, setCategory] = useState('Investments & Savings');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [monthlyContribution, setMonthlyContribution] = useState('15000');
  const [expectedReturnRate, setExpectedReturnRate] = useState('10');
  const [icon, setIcon] = useState('🏠');
  const [notes, setNotes] = useState('');

  const iconsList = ['🏠', '✈️', '🚗', '🎓', '💻', '💍', '🚨', '📈', '🏖️', '🏎️', '💎'];

  // AI Suggested Monthly Deposit
  const targetNum = Number(targetAmount) || 500000;
  const targetDate = new Date(deadline);
  const months = Math.max(
    1,
    (targetDate.getFullYear() - new Date().getFullYear()) * 12 +
      (targetDate.getMonth() - new Date().getMonth())
  );
  const aiSuggestedMonthly = Math.ceil(targetNum / months);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title,
      targetAmount: Number(targetAmount) || 100000,
      deadline,
      category,
      priority,
      monthlyContribution: Number(monthlyContribution) || aiSuggestedMonthly,
      expectedReturnRate: Number(expectedReturnRate) || 10,
      icon,
      notes,
      riskLevel: priority === 'high' ? 'low' : 'medium',
      history: [],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
            Goal Creator
          </span>
          <h3 className="text-xl font-extrabold text-slate-900">Create Financial Goal</h3>
          <p className="text-xs text-slate-500">
            Set up an interactive goal with Savorah AI monthly planning recommendations
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Icon Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Choose Icon</label>
            <div className="flex flex-wrap gap-2">
              {iconsList.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-10 h-10 rounded-2xl border text-xl flex items-center justify-center transition-all ${
                    icon === ic
                      ? 'bg-emerald-100 border-emerald-500 shadow-xs scale-110'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Goal Name</label>
            <input
              type="text"
              placeholder="e.g. Home Down Payment, Vacation, Emergency Buffer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Amount (₹)</label>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-black text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Date</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
                required
              />
            </div>
          </div>

          {/* AI Suggested Contribution Callout */}
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold text-emerald-950">
                AI Monthly Recommendation:
              </span>
            </div>
            <strong className="font-black text-emerald-900">₹{aiSuggestedMonthly.toLocaleString('en-IN')}/mo</strong>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Deposit (₹)</label>
              <input
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expected Return (%)</label>
              <input
                type="number"
                value={expectedReturnRate}
                onChange={(e) => setExpectedReturnRate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
              >
                {CATEGORY_COLORS.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Description</label>
            <input
              type="text"
              placeholder="Optional notes or details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 transition-all"
          >
            Launch Financial Goal
          </button>
        </form>
      </div>
    </div>
  );
};
