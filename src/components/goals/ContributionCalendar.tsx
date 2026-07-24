import React, { useState } from 'react';
import { SavingsGoal } from '../../types';
import { CalendarDays, CheckCircle2, Clock, AlertCircle, ChevronRight } from 'lucide-react';

interface ContributionCalendarProps {
  goals: SavingsGoal[];
}

export const ContributionCalendar: React.FC<ContributionCalendarProps> = ({ goals }) => {
  const [filter, setFilter] = useState<'all' | 'completed' | 'upcoming'>('all');

  const schedule = [
    { id: '1', goal: goals[0]?.title || 'Home Down Payment', date: '01 July 2026', amount: 45000, status: 'completed' },
    { id: '2', goal: goals[1]?.title || 'Japan Vacation', date: '05 July 2026', amount: 25000, status: 'completed' },
    { id: '3', goal: 'Emergency Reserve', date: '15 July 2026', amount: 15000, status: 'completed' },
    { id: '4', goal: goals[0]?.title || 'Home Down Payment', date: '01 August 2026', amount: 45000, status: 'upcoming' },
    { id: '5', goal: goals[1]?.title || 'Japan Vacation', date: '05 August 2026', amount: 25000, status: 'upcoming' },
  ];

  const filtered = schedule.filter((item) => (filter === 'all' ? true : item.status === filter));

  const fmt = (v: number) => `₹${v.toLocaleString('en-IN')}`;

  return (
    <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/60">
            <CalendarDays className="w-4 h-4" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Monthly Contribution Schedule
          </h3>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              filter === 'completed' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              filter === 'upcoming' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            Upcoming
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition-all border border-slate-200/60"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                  item.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {item.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900">{item.goal}</h4>
                <p className="text-[10px] font-bold text-slate-400">{item.date}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-black text-slate-900 block">{fmt(item.amount)}</span>
              <span
                className={`text-[10px] font-extrabold uppercase ${
                  item.status === 'completed' ? 'text-emerald-700' : 'text-amber-800'
                }`}
              >
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
