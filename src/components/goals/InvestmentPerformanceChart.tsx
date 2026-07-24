import React, { useState } from 'react';
import { SavingsGoal } from '../../types';
import { goalPredictionService } from '../../services/goalPredictionService';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, BarChart2 } from 'lucide-react';

interface InvestmentPerformanceChartProps {
  goals: SavingsGoal[];
}

export const InvestmentPerformanceChart: React.FC<InvestmentPerformanceChartProps> = ({ goals }) => {
  const [period, setPeriod] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('6M');

  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const series = goalPredictionService.generatePerformanceSeries(period, totalSaved);

  const fmt = (v: number) => `₹${(v / 1000).toFixed(0)}k`;

  return (
    <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
            <BarChart2 className="w-4 h-4" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Portfolio Growth Performance
          </h3>
        </div>

        {/* Time period toggles */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
          {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 rounded-xl transition-all ${
                period === p ? 'bg-white text-emerald-800 shadow-xs font-black' : 'text-slate-500'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="h-56 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series}>
            <defs>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={fmt} tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip
              formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Portfolio Value']}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#actualGrad)"
            />
            <Area
              type="monotone"
              dataKey="target"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={0}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 border-t border-slate-100 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-emerald-500 rounded-full" />
          <span>Actual Portfolio Growth</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-slate-400 border-dashed border-slate-400 border-b" />
          <span>Benchmark Growth</span>
        </div>
      </div>
    </div>
  );
};
