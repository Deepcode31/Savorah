import React from 'react';
import { SavingsGoal } from '../../types';
import {
  Calendar,
  Sparkles,
  ChevronRight,
  PlusCircle,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface GoalCardProps {
  goal: SavingsGoal;
  onOpenQuickAdd: (goal: SavingsGoal) => void;
  onOpenDetails: (goal: SavingsGoal) => void;
  onDelete: (goalId: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onOpenQuickAdd,
  onOpenDetails,
  onDelete,
}) => {
  const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const isCompleted = goal.currentAmount >= goal.targetAmount;

  // Icon mapping or default
  const defaultIcon = goal.icon || '🎯';

  // Format currency
  const fmt = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const riskColor =
    goal.riskLevel === 'high'
      ? 'bg-rose-100 text-rose-800 border-rose-200'
      : goal.riskLevel === 'medium'
      ? 'bg-amber-100 text-amber-800 border-amber-200'
      : 'bg-emerald-100 text-emerald-800 border-emerald-200';

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all space-y-4 relative overflow-hidden flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-500/20 flex items-center justify-center text-2xl shadow-xs shrink-0">
            {defaultIcon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase tracking-wider">
                {goal.category}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${riskColor}`}>
                {goal.riskLevel ? `${goal.riskLevel.toUpperCase()} RISK` : 'LOW RISK'}
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
              {goal.title}
            </h3>
          </div>
        </div>

        <button
          onClick={() => onDelete(goal.id)}
          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
          title="Delete Goal"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Progress & Values Section */}
      <div className="flex items-center justify-between gap-4 py-1">
        {/* SVG Circular Donut Ring */}
        <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <circle
              className="text-slate-100"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              cx="18"
              cy="18"
              r="15.9155"
            />
            <circle
              className="text-emerald-500 transition-all duration-1000 ease-out"
              strokeDasharray={`${percent}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              cx="18"
              cy="18"
              r="15.9155"
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-xs font-black text-slate-900 block">{percent}%</span>
            <span className="text-[9px] font-bold text-slate-400 block">Saved</span>
          </div>
        </div>

        {/* Stats Column */}
        <div className="flex-1 space-y-1 text-right sm:text-left">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-500">Saved:</span>
            <span className="font-black text-slate-900">{fmt(goal.currentAmount)}</span>
          </div>
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-500">Target:</span>
            <span className="font-extrabold text-slate-800">{fmt(goal.targetAmount)}</span>
          </div>
          <div className="flex justify-between text-xs font-semibold pt-0.5 border-t border-slate-100">
            <span className="text-slate-500">Remaining:</span>
            <span className="font-bold text-emerald-700">{fmt(remaining)}</span>
          </div>
        </div>
      </div>

      {/* Monthly Contribution & Target Date Info */}
      <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-center justify-between text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>SIP: <strong className="text-slate-900">{fmt(goal.monthlyContribution || 10000)}/mo</strong></span>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Due: {goal.deadline}</span>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="pt-2 flex items-center gap-2">
        {isCompleted ? (
          <div className="w-full py-2.5 rounded-2xl bg-emerald-100 text-emerald-900 font-extrabold text-xs flex items-center justify-center gap-2 border border-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Target Reached 🎉
          </div>
        ) : (
          <>
            <button
              onClick={() => onOpenQuickAdd(goal)}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              Add Money
            </button>

            <button
              onClick={() => onOpenDetails(goal)}
              className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center gap-1"
            >
              <span>Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
