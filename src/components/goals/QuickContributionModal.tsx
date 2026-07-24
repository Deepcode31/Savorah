import React, { useState } from 'react';
import { SavingsGoal } from '../../types';
import { X, IndianRupee, Sparkles, CheckCircle2 } from 'lucide-react';

interface QuickContributionModalProps {
  goal: SavingsGoal;
  onClose: () => void;
  onConfirm: (goalId: string, amount: number) => void;
}

export const QuickContributionModal: React.FC<QuickContributionModalProps> = ({
  goal,
  onClose,
  onConfirm,
}) => {
  const [amount, setAmount] = useState<number>(5000);
  const [customInput, setCustomInput] = useState<string>('5000');

  const handleSelectPreset = (val: number) => {
    setAmount(val);
    setCustomInput(val.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalVal = Number(customInput) || amount;
    if (finalVal <= 0) return;
    onConfirm(goal.id, finalVal);
    onClose();
  };

  const fmt = (v: number) => `₹${v.toLocaleString('en-IN')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
            Deposit Top-Up
          </span>
          <h3 className="text-lg font-extrabold text-slate-900">{goal.title}</h3>
          <p className="text-xs text-slate-500">
            Current: <strong className="text-slate-800">{fmt(goal.currentAmount)}</strong> /{' '}
            {fmt(goal.targetAmount)}
          </p>
        </div>

        {/* Presets */}
        <div className="grid grid-cols-3 gap-2">
          {[500, 1000, 5000].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`py-2.5 rounded-2xl text-xs font-black border transition-all ${
                Number(customInput) === preset
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
              }`}
            >
              +₹{preset}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">
              Custom Amount (₹)
            </label>
            <input
              type="number"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-black text-slate-900"
              placeholder="e.g. 2500"
              required
              min="1"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            Confirm Deposit & Update Progress
          </button>
        </form>
      </div>
    </div>
  );
};
