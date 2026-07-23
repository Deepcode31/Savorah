import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types';
import { CATEGORY_COLORS } from '../../data/initialData';
import {
  Target,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  DollarSign,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';

export const SavingsGoalsView: React.FC = () => {
  const { goals, addGoal, contributeToGoal, deleteGoal } = useFinance();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState('100');

  // Form State
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('1000');
  const [deadline, setDeadline] = useState('2026-12-31');
  const [category, setCategory] = useState('Investments & Savings');
  const [notes, setNotes] = useState('');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount) return;

    addGoal({
      title,
      targetAmount: Number(targetAmount) || 1000,
      deadline,
      category,
      notes,
    });

    setIsAddOpen(false);
    setTitle('');
    setTargetAmount('1000');
  };

  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeGoalId || !contributeAmount) return;
    contributeToGoal(contributeGoalId, Number(contributeAmount) || 0);
    setContributeGoalId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Savings & Financial Goals
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track progress toward your home down payment, vacation, emergency buffer, or education funds.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create New Goal
        </button>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((g) => {
          const percent = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
          const isCompleted = g.currentAmount >= g.targetAmount;

          return (
            <div
              key={g.id}
              className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5 space-y-4 hover:border-emerald-500/35 transition-all relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                    {g.category}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900">{g.title}</h3>
                  {g.notes && <p className="text-xs text-slate-500">{g.notes}</p>}
                </div>

                <button
                  onClick={() => deleteGoal(g.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Amounts & Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600">
                    Saved: <strong className="text-slate-900">${g.currentAmount.toLocaleString()}</strong>
                  </span>
                  <span className="text-slate-600">
                    Target: <strong className="text-slate-900">${g.targetAmount.toLocaleString()}</strong>
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        : 'bg-emerald-600'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Target Date: {g.deadline}
                  </span>
                  <span className="text-emerald-700 font-extrabold">{percent}%</span>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2">
                {isCompleted ? (
                  <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Goal Target Achieved! 🎉
                  </div>
                ) : (
                  <button
                    onClick={() => setContributeGoalId(g.id)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 text-xs font-bold border border-slate-200 transition-all flex items-center justify-center gap-1.5"
                  >
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    Add Deposit / Contribution
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Contribute Modal */}
      {contributeGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setContributeGoalId(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900">Add Deposit to Goal</h3>

            <form onSubmit={handleContribute} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deposit Amount ($)
                </label>
                <input
                  type="number"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-bold"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md"
              >
                Confirm Deposit
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900">Create Financial Goal</h3>

            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Japan Trip 2026 or House Deposit"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Amount ($)
                  </label>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                >
                  {CATEGORY_COLORS.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes / Description
                </label>
                <input
                  type="text"
                  placeholder="Optional details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md"
              >
                Launch Savings Goal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
