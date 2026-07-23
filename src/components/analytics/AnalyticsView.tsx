import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CATEGORY_COLORS } from '../../data/initialData';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { PieChart, BarChart3, TrendingUp, Sparkles, Filter, ShieldCheck } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const {
    transactions,
    budgets,
    totalIncome,
    totalExpense,
    essentialExpenseTotal,
    nonEssentialExpenseTotal,
  } = useFinance();

  // Aggregate category totals from expense transactions
  const categoryDataMap: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryDataMap[t.category] = (categoryDataMap[t.category] || 0) + t.amount;
    });

  // Prepare Pie Chart data with multi-color palette
  const pieChartData = Object.keys(categoryDataMap).map((catName) => {
    const matchedColor =
      CATEGORY_COLORS.find((c) => c.name === catName)?.color || '#64748B';
    return {
      name: catName,
      value: categoryDataMap[catName],
      color: matchedColor,
    };
  });

  // Income vs Expense comparison data
  const comparisonData = [
    { name: 'Income Inflow', amount: totalIncome, fill: '#10B981' },
    { name: 'Total Expense Outflow', amount: totalExpense, fill: '#EF4444' },
    { name: 'Essential Living Costs', amount: essentialExpenseTotal, fill: '#3B82F6' },
    { name: 'Non-Essential Spending', amount: nonEssentialExpenseTotal, fill: '#8B5CF6' },
  ];

  // Category vs Budget Limit comparison bar data
  const budgetVsActualData = budgets.map((b) => ({
    name: b.category.split(' ')[0], // short name
    fullName: b.category,
    Spent: b.spent,
    Limit: b.limit,
  }));

  const VIBRANT_PIE_COLORS = [
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#EF4444', // Red
    '#14B8A6', // Teal
    '#6366F1', // Indigo
    '#F97316', // Orange
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Visual Financial Analytics & Pie Charts
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Interactive multi-color pie charts and bar breakdowns to analyze cash flow, category distribution, and essential spending ratios.
        </p>
      </div>

      {/* Main Grid: Pie Chart + Category List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Multi-color Pie Chart Card */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-extrabold text-slate-900">
                Expense Category Distribution (Multi-Color Pie Chart)
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total: ${totalExpense.toLocaleString()}
            </span>
          </div>

          <div className="h-72 w-full">
            {pieChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No expense data recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || VIBRANT_PIE_COLORS[index % VIBRANT_PIE_COLORS.length]}
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Spent']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '16px',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Legend / Category List Breakdown */}
        <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5 space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100">
            Category Breakdown
          </h3>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {pieChartData.map((item, idx) => {
              const percent =
                totalExpense > 0 ? Math.round((item.value / totalExpense) * 100) : 0;

              return (
                <div key={item.name} className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-800 truncate max-w-[130px]">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-900 font-bold">${item.value.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400">{percent}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bar Charts: Income vs Expense & Budget vs Actual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Comparison Bar Chart */}
        <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-teal-600" />
              <h3 className="text-base font-extrabold text-slate-900">
                Income vs Expense Structure
              </h3>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                  }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Limit vs Actual Spent Bar Chart */}
        <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-extrabold text-slate-900">
                Budget Limit vs Actual Spent
              </h3>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetVsActualData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                  }}
                />
                <Legend />
                <Bar dataKey="Spent" fill="#EF4444" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Limit" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
