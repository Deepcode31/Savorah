import React from 'react';
import { SavingsGoal } from '../../types';
import { goalPredictionService } from '../../services/goalPredictionService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

interface InvestmentAllocationChartProps {
  goals: SavingsGoal[];
}

export const InvestmentAllocationChart: React.FC<InvestmentAllocationChartProps> = ({ goals }) => {
  const allocation = goalPredictionService.calculateAssetAllocation(goals);
  const total = allocation.reduce((acc, curr) => acc + curr.value, 0);

  const fmt = (v: number) => `₹${v.toLocaleString('en-IN')}`;

  return (
    <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-teal-50 text-teal-600 border border-teal-200/60">
            <PieIcon className="w-4 h-4" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Portfolio Asset Allocation
          </h3>
        </div>
        <span className="text-xs font-bold text-slate-500">
          Total: <strong className="text-slate-900">{fmt(total)}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Recharts Pie Donut */}
        <div className="md:col-span-5 h-48 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allocation}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {allocation.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any) => [fmt(Number(val)), 'Allocated']}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Table */}
        <div className="md:col-span-7 space-y-2">
          {allocation.map((item) => {
            const pct = Math.round((item.value / total) * 100);

            return (
              <div key={item.name} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-slate-900">{fmt(item.value)}</span>
                  <span className="w-8 text-right font-bold text-slate-400">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
