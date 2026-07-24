import React from 'react';
import { SavingsGoal } from '../../types';
import { CheckCircle2, Clock, Calendar, Flag } from 'lucide-react';

interface GoalTimelineProps {
  goals: SavingsGoal[];
}

export const GoalTimeline: React.FC<GoalTimelineProps> = ({ goals }) => {
  const activeGoal = goals[0] || {
    id: 'sg-1',
    title: 'Home Down Payment',
    currentAmount: 2240000,
    targetAmount: 3500000,
    deadline: '2027-06-30',
  };

  const pct = Math.min(100, Math.round((activeGoal.currentAmount / activeGoal.targetAmount) * 100));

  const milestones = [
    { label: 'Today', percent: 0, title: 'Goal Initiated', date: 'Jan 2026', done: true },
    { label: '25%', percent: 25, title: 'Quarter Milestone', date: 'Apr 2026', done: pct >= 25 },
    { label: '50%', percent: 50, title: 'Halfway Mark', date: 'Oct 2026', done: pct >= 50 },
    { label: '75%', percent: 75, title: 'Final Stretch', date: 'Jan 2027', done: pct >= 75 },
    { label: '100%', percent: 100, title: 'Target Achieved', date: activeGoal.deadline, done: pct >= 100 },
  ];

  return (
    <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Financial Goal Timeline & Milestones
          </h3>
          <p className="text-xs text-slate-500">
            Active tracking for <strong className="text-slate-800">{activeGoal.title}</strong> ({pct}% complete)
          </p>
        </div>

        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          Target: {activeGoal.deadline}
        </span>
      </div>

      {/* Horizontal Milestone Timeline Bar */}
      <div className="py-4 px-2">
        <div className="relative flex items-center justify-between">
          {/* Connecting Line Background */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 bg-slate-100 rounded-full z-0" />
          {/* Active Progress Line */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full z-0 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />

          {milestones.map((m, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs transition-all ${
                  m.done
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-110'
                    : 'bg-white text-slate-400 border-2 border-slate-200'
                }`}
              >
                {m.done ? <CheckCircle2 className="w-5 h-5 text-white" /> : m.label}
              </div>

              <div className="text-center mt-3">
                <span className="text-xs font-extrabold text-slate-900 block">{m.title}</span>
                <span className="text-[10px] font-bold text-slate-400 block">{m.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
