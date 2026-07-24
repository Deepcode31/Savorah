import React from 'react';
import { SavingsGoal } from '../../types';
import {
  X,
  Calendar,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  History,
  ShieldAlert,
} from 'lucide-react';

interface GoalDrawerProps {
  goal: SavingsGoal | null;
  onClose: () => void;
}

export const GoalDrawer: React.FC<GoalDrawerProps> = ({ goal, onClose }) => {
  if (!goal) return null;

  const fmt = (v: number) => `₹${v.toLocaleString('en-IN')}`;
  const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  const riskColor =
    goal.riskLevel === 'high'
      ? 'text-rose-600 bg-rose-50 border-rose-200'
      : goal.riskLevel === 'medium'
      ? 'text-amber-600 bg-amber-50 border-amber-200'
      : 'text-emerald-600 bg-emerald-50 border-emerald-200';

  const riskText =
    goal.riskLevel === 'high'
      ? 'Contribution rate is lagging target deadline. Consider increasing SIP by +₹2,500/mo.'
      : goal.riskLevel === 'medium'
      ? 'On track, but vulnerable to market volatility. Maintain steady monthly deposits.'
      : 'Current contribution rate is optimal. High likelihood of achieving target on schedule.';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-md animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl p-6 flex flex-col justify-between overflow-y-auto space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xl">
                  {goal.icon || '🎯'}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{goal.title}</h3>
                  <p className="text-xs text-slate-500">{goal.category}</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Overview Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">Target Progress</span>
                <span className="text-emerald-700">{pct}%</span>
              </div>

              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${pct}%` }} />
              </div>

              <div className="flex justify-between text-xs font-semibold pt-1">
                <span>Saved: <strong className="text-slate-900">{fmt(goal.currentAmount)}</strong></span>
                <span>Target: <strong className="text-slate-800">{fmt(goal.targetAmount)}</strong></span>
              </div>
            </div>

            {/* AI Risk Analysis Box */}
            <div className={`p-4 rounded-2xl border ${riskColor} space-y-1.5`}>
              <div className="flex items-center gap-2 font-extrabold text-xs uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4" />
                <span>AI Risk Assessment: {goal.riskLevel || 'Low'} Risk</span>
              </div>
              <p className="text-xs font-semibold leading-relaxed">
                {riskText}
              </p>
            </div>

            {/* AI Strategy Advice */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/60 border border-emerald-200/80 text-slate-900 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-extrabold uppercase">
                <Sparkles className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                <span>Savorah AI Wealth Advisor</span>
              </div>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                Allocating 60% into High-Yield Index Funds and 40% into Liquid Debt FDs will maximize tax-free compounding for this goal timeline.
              </p>
            </div>

            {/* Contribution History */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
                <History className="w-4 h-4 text-emerald-600" />
                <span>Contribution History</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(goal.history || [
                  { id: '1', amount: goal.monthlyContribution || 10000, date: '2026-07-01', note: 'Monthly Auto Deposit' },
                ]).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs"
                  >
                    <div>
                      <span className="font-extrabold text-slate-900 block">{fmt(item.amount)}</span>
                      <span className="text-[10px] text-slate-400 font-bold">{item.note || 'Deposit'}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {goal.notes && (
              <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-600 border border-slate-200/60">
                <strong>Notes:</strong> {goal.notes}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 transition-all"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
