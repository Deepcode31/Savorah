import React from 'react';
import { SavingsGoal } from '../../types';
import {
  Target,
  PiggyBank,
  TrendingUp,
  Calendar,
  Percent,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

interface GoalSummaryCardsProps {
  goals: SavingsGoal[];
}

export const GoalSummaryCards: React.FC<GoalSummaryCardsProps> = ({ goals }) => {
  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const remaining = Math.max(0, totalTarget - totalSaved);
  const monthlyInvest = goals.reduce((acc, g) => acc + (g.monthlyContribution || 10000), 0);
  const completionPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  // Format currency helper
  const fmt = (val: number) =>
    `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {/* 1. Total Goal Target */}
      <div className="p-4 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xs space-y-1.5 hover:border-emerald-500/30 transition-all">
        <div className="flex items-center justify-between text-slate-500 text-[11px] font-extrabold uppercase tracking-wider">
          <span>Target</span>
          <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
            <Target className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
          {fmt(totalTarget)}
        </div>
        <p className="text-[10px] font-bold text-slate-400">
          Across {goals.length} Goals
        </p>
      </div>

      {/* 2. Total Saved */}
      <div className="p-4 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xs space-y-1.5 hover:border-teal-500/30 transition-all">
        <div className="flex items-center justify-between text-slate-500 text-[11px] font-extrabold uppercase tracking-wider">
          <span>Total Saved</span>
          <div className="p-1.5 rounded-xl bg-teal-50 text-teal-600">
            <PiggyBank className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-lg sm:text-xl font-black text-emerald-700 tracking-tight">
          {fmt(totalSaved)}
        </div>
        <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-full">
          <ArrowUpRight className="w-3 h-3" />
          On Track
        </span>
      </div>

      {/* 3. Remaining Amount */}
      <div className="p-4 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xs space-y-1.5 hover:border-amber-500/30 transition-all">
        <div className="flex items-center justify-between text-slate-500 text-[11px] font-extrabold uppercase tracking-wider">
          <span>Remaining</span>
          <div className="p-1.5 rounded-xl bg-amber-50 text-amber-600">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">
          {fmt(remaining)}
        </div>
        <p className="text-[10px] font-bold text-slate-400">
          Needed for 100%
        </p>
      </div>

      {/* 4. Monthly Investment */}
      <div className="p-4 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xs space-y-1.5 hover:border-emerald-500/30 transition-all">
        <div className="flex items-center justify-between text-slate-500 text-[11px] font-extrabold uppercase tracking-wider">
          <span>Monthly SIP</span>
          <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
          {fmt(monthlyInvest)}
        </div>
        <p className="text-[10px] font-bold text-emerald-700">
          Auto-invest active
        </p>
      </div>

      {/* 5. Completion Rate */}
      <div className="p-4 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xs space-y-1.5 hover:border-teal-500/30 transition-all">
        <div className="flex items-center justify-between text-slate-500 text-[11px] font-extrabold uppercase tracking-wider">
          <span>Progress</span>
          <div className="p-1.5 rounded-xl bg-teal-50 text-teal-600">
            <Percent className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
          {completionPct}%
        </div>
        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      {/* 6. Est. Completion Date */}
      <div className="p-4 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xs space-y-1.5 hover:border-purple-500/30 transition-all">
        <div className="flex items-center justify-between text-slate-500 text-[11px] font-extrabold uppercase tracking-wider">
          <span>Target Date</span>
          <div className="p-1.5 rounded-xl bg-purple-50 text-purple-600">
            <Calendar className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-sm font-black text-slate-900 tracking-tight pt-1">
          June 2027
        </div>
        <p className="text-[10px] font-bold text-slate-400">
          AI Projection
        </p>
      </div>
    </div>
  );
};
