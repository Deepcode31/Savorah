import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LabelList,
} from 'recharts';
import { PieChart, BarChart3, TrendingUp, CalendarDays, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useFinance } from '../../../context/FinanceContext';
import { useTheme } from '../../../context/ThemeContext';
import { CATEGORY_COLORS } from '../../../data/initialData';
import { formatMoney } from '../../../utils/currency';
import type { Transaction } from '../../../types';

type CompareMode = 'month' | 'year';

type PeriodBucket = {
  key: string;
  label: string;
  income: number;
  expense: number;
  essentials: number;
  lifestyle: number;
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function periodKey(date: string, mode: CompareMode): string {
  return mode === 'year' ? date.slice(0, 4) : date.slice(0, 7);
}

function periodLabel(key: string, mode: CompareMode): string {
  if (mode === 'year') return key;
  const [y, m] = key.split('-');
  const month = MONTH_LABELS[Number(m) - 1] ?? m;
  return `${month} ${y}`;
}

function buildPeriodBuckets(transactions: Transaction[], mode: CompareMode): PeriodBucket[] {
  const map = new Map<string, PeriodBucket>();

  for (const t of transactions) {
    const key = periodKey(t.date, mode);
    let bucket = map.get(key);
    if (!bucket) {
      bucket = { key, label: periodLabel(key, mode), income: 0, expense: 0, essentials: 0, lifestyle: 0 };
      map.set(key, bucket);
    }
    if (t.type === 'income') {
      bucket.income += t.amount;
    } else {
      bucket.expense += t.amount;
      if (t.isEssential) bucket.essentials += t.amount;
      else bucket.lifestyle += t.amount;
    }
  }

  return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
}

function inPeriod(date: string, key: string, mode: CompareMode): boolean {
  return periodKey(date, mode) === key;
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

const Card: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({
  children,
  className = '',
  delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    className={`glass card-ring rounded-3xl p-6 ${className}`}
  >
    {children}
  </motion.div>
);

const DeltaBadge: React.FC<{ value: number | null; invert?: boolean }> = ({ value, invert = false }) => {
  if (value === null) {
    return <span className="text-[11px] font-semibold text-mist-500">New</span>;
  }
  const upIsGood = !invert;
  const isUp = value > 0;
  const good = isUp ? upIsGood : !upIsGood;
  const Icon = isUp ? ArrowUpRight : ArrowDownRight;
  const color = value === 0 ? 'text-mist-500' : good ? 'text-emerald-500' : 'text-rose-500';
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      {Math.abs(value).toFixed(1)}%
    </span>
  );
};

const AnalyticsView: React.FC = () => {
  const { transactions, budgets } = useFinance();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [mode, setMode] = useState<CompareMode>('month');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const chartInk = isLight ? '#3d6b58' : '#8b968f';
  const gridStroke = isLight ? 'rgba(5,150,105,0.12)' : 'rgba(255,255,255,0.06)';
  const cursorFill = isLight ? 'rgba(5,150,105,0.06)' : 'rgba(255,255,255,0.04)';
  const pieStroke = isLight ? '#f0faf6' : 'rgba(6,8,10,0.9)';
  const incomeFill = isLight ? '#059669' : '#34d399';
  const expenseFill = isLight ? '#e11d48' : '#fb7185';

  const tooltipStyle: React.CSSProperties = useMemo(
    () => ({
      backgroundColor: isLight ? 'rgba(255,255,255,0.96)' : 'rgba(17, 22, 27, 0.95)',
      borderRadius: '14px',
      border: isLight ? '1px solid rgba(5,150,105,0.18)' : '1px solid rgba(255,255,255,0.12)',
      fontSize: '12px',
      color: isLight ? '#06251a' : '#f2f5f4',
      boxShadow: isLight
        ? '0 12px 32px -12px rgba(5,150,105,0.28)'
        : '0 12px 32px -12px rgba(0,0,0,0.55)',
    }),
    [isLight]
  );

  const buckets = useMemo(() => buildPeriodBuckets(transactions, mode), [transactions, mode]);

  const activeKey = useMemo(() => {
    if (selectedKey && buckets.some((b) => b.key === selectedKey)) return selectedKey;
    return buckets.length ? buckets[buckets.length - 1].key : null;
  }, [buckets, selectedKey]);

  const activeIndex = buckets.findIndex((b) => b.key === activeKey);
  const current = activeIndex >= 0 ? buckets[activeIndex] : null;
  const previous = activeIndex > 0 ? buckets[activeIndex - 1] : null;

  const scopedTx = useMemo(() => {
    if (!activeKey) return transactions;
    return transactions.filter((t) => inPeriod(t.date, activeKey, mode));
  }, [transactions, activeKey, mode]);

  const totalIncome = useMemo(
    () => scopedTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [scopedTx]
  );
  const totalExpense = useMemo(
    () => scopedTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [scopedTx]
  );
  const essentialExpenseTotal = useMemo(
    () => scopedTx.filter((t) => t.type === 'expense' && t.isEssential).reduce((s, t) => s + t.amount, 0),
    [scopedTx]
  );
  const nonEssentialExpenseTotal = useMemo(
    () => scopedTx.filter((t) => t.type === 'expense' && !t.isEssential).reduce((s, t) => s + t.amount, 0),
    [scopedTx]
  );

  const pieData = useMemo(() => {
    const map: Record<string, number> = {};
    scopedTx
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value,
        color: CATEGORY_COLORS.find((c) => c.name === name)?.color || '#64748B',
      }))
      .sort((a, b) => b.value - a.value);
  }, [scopedTx]);

  const comparisonData = [
    { name: 'Income', amount: totalIncome, fill: incomeFill },
    { name: 'Expenses', amount: totalExpense, fill: expenseFill },
    { name: 'Essentials', amount: essentialExpenseTotal, fill: isLight ? '#2563eb' : '#60a5fa' },
    { name: 'Lifestyle', amount: nonEssentialExpenseTotal, fill: isLight ? '#7c3aed' : '#c084fc' },
  ];

  const budgetVsActual = budgets.map((b) => ({
    name: b.category.split(' ')[0],
    Spent: b.spent,
    Limit: b.limit,
  }));

  const timelineData = buckets.map((b) => ({
    name: b.label,
    key: b.key,
    Income: b.income,
    Expenses: b.expense,
    Net: b.income - b.expense,
  }));

  const vsPrevious = current && previous
    ? {
        income: pctChange(current.income, previous.income),
        expense: pctChange(current.expense, previous.expense),
        net: pctChange(current.income - current.expense, previous.income - previous.expense),
      }
    : null;

  const formatAxis = (v: number) => {
    if (v >= 100000) return `${(v / 100000).toFixed(1)}L`;
    if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`;
    return String(v);
  };

  const handleModeChange = (next: CompareMode) => {
    setMode(next);
    setSelectedKey(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-mist-500 mt-1">
            Compare cash flow by month or year, then drill into categories and budgets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex rounded-2xl bg-white/5 border border-white/8 p-1" role="tablist" aria-label="Compare by">
            {([
              { id: 'month' as const, label: 'Months' },
              { id: 'year' as const, label: 'Years' },
            ]).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleModeChange(opt.id)}
                className={`relative px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  mode === opt.id ? 'text-ink-950' : 'text-mist-500 hover:text-mist-100'
                }`}
                role="tab"
                aria-selected={mode === opt.id}
              >
                {mode === opt.id && (
                  <motion.span
                    layoutId="analytics-mode-pill"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'var(--accent)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{opt.label}</span>
              </button>
            ))}
          </div>

          <select
            value={activeKey ?? ''}
            onChange={(e) => setSelectedKey(e.target.value || null)}
            disabled={buckets.length === 0}
            className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/8 text-xs font-semibold text-mist-300 focus:outline-none focus:border-emerald-400/50 [&>option]:bg-ink-800 disabled:opacity-50"
            aria-label={mode === 'month' ? 'Select month' : 'Select year'}
          >
            {buckets.length === 0 && <option value="">No periods yet</option>}
            {buckets.map((b) => (
              <option key={b.key} value={b.key}>
                {b.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Period comparison */}
      <Card delay={0.02}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <h3 className="font-display text-lg font-semibold flex items-center gap-2.5">
            <CalendarDays className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            {mode === 'month' ? 'Month-over-month' : 'Year-over-year'}
          </h3>
          {current && previous && (
            <p className="text-xs text-mist-500">
              Comparing <span className="font-semibold text-mist-300">{current.label}</span>
              {' '}vs{' '}
              <span className="font-semibold text-mist-300">{previous.label}</span>
            </p>
          )}
        </div>

        {current && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Income', value: current.income, delta: vsPrevious?.income ?? null, invert: false },
              { label: 'Expenses', value: current.expense, delta: vsPrevious?.expense ?? null, invert: true },
              {
                label: 'Net',
                value: current.income - current.expense,
                delta: vsPrevious?.net ?? null,
                invert: false,
              },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white/5 border border-white/8 px-4 py-3.5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-mist-500">{stat.label}</p>
                  {previous ? <DeltaBadge value={stat.delta} invert={stat.invert} /> : (
                    <span className="text-[11px] text-mist-500">No prior {mode}</span>
                  )}
                </div>
                <p className="font-display text-xl font-semibold tracking-tight">{formatMoney(stat.value)}</p>
                {previous && (
                  <p className="text-[11px] text-mist-500 mt-1">
                    Prev {mode}: {formatMoney(
                      stat.label === 'Income'
                        ? previous.income
                        : stat.label === 'Expenses'
                          ? previous.expense
                          : previous.income - previous.expense
                    )}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="h-72">
          {timelineData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-mist-500">
              Add transactions to unlock period comparisons.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timelineData} margin={{ top: 20, right: 8, left: -8, bottom: 4 }} barGap={4} barCategoryGap="18%">
                <defs>
                  <linearGradient id="cmpIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={incomeFill} stopOpacity={1} />
                    <stop offset="100%" stopColor={incomeFill} stopOpacity={0.5} />
                  </linearGradient>
                  <linearGradient id="cmpExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={expenseFill} stopOpacity={1} />
                    <stop offset="100%" stopColor={expenseFill} stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 6" stroke={gridStroke} vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: chartInk, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: chartInk }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatAxis}
                  width={42}
                />
                <Tooltip
                  formatter={(value: any) => formatMoney(Number(value))}
                  contentStyle={tooltipStyle}
                  cursor={{ fill: cursorFill, radius: 8 }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, color: chartInk, paddingTop: 8 }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar
                  dataKey="Income"
                  fill="url(#cmpIncome)"
                  radius={[8, 8, 4, 4]}
                  maxBarSize={32}
                  animationDuration={900}
                  onClick={(data: any) => data?.payload?.key && setSelectedKey(data.payload.key)}
                  cursor="pointer"
                />
                <Bar
                  dataKey="Expenses"
                  fill="url(#cmpExpense)"
                  radius={[8, 8, 4, 4]}
                  maxBarSize={32}
                  animationDuration={900}
                  onClick={(data: any) => data?.payload?.key && setSelectedKey(data.payload.key)}
                  cursor="pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        {timelineData.length > 0 && (
          <p className="text-[11px] text-mist-500 mt-3">
            Click a bar to focus charts below on that {mode}. Currently viewing{' '}
            <span className="font-semibold text-mist-300">{current?.label ?? '—'}</span>.
          </p>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Donut */}
        <Card className="lg:col-span-2" delay={0.05}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2.5">
              <PieChart className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              Spending by category
            </h3>
            <span className="text-xs font-semibold text-mist-500 uppercase tracking-widest">
              {current?.label ?? 'All'} · {formatMoney(totalExpense)}
            </span>
          </div>
          <div className="h-72">
            {pieData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-mist-500">
                No expense data for this {mode}.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={104}
                    paddingAngle={4}
                    dataKey="value"
                    stroke={pieStroke}
                    strokeWidth={3}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [formatMoney(Number(value)), 'Spent']}
                    contentStyle={tooltipStyle}
                    itemStyle={{ color: isLight ? '#06251a' : '#f2f5f4' }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Breakdown list */}
        <Card delay={0.12}>
          <h3 className="font-display text-lg font-semibold mb-5">Breakdown</h3>
          <div className="space-y-4 max-h-72 overflow-y-auto custom-scrollbar pr-1">
            {pieData.length === 0 && <p className="text-sm text-mist-500">Nothing to break down yet.</p>}
            {pieData.map((item, i) => {
              const pct = totalExpense > 0 ? Math.round((item.value / totalExpense) * 100) : 0;
              return (
                <div key={item.name}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="truncate text-mist-300">{item.name}</span>
                    </span>
                    <span className="font-semibold shrink-0 ml-2">{formatMoney(item.value)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.9, delay: 0.2 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Cash flow */}
        <Card delay={0.18}>
          <h3 className="font-display text-lg font-semibold flex items-center gap-2.5 mb-5">
            <BarChart3 className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            Cash flow structure
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 28, right: 8, left: -8, bottom: 4 }} barCategoryGap="22%">
                <defs>
                  {comparisonData.map((entry) => (
                    <linearGradient key={`g-${entry.name}`} id={`bar-${entry.name}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={entry.fill} stopOpacity={1} />
                      <stop offset="100%" stopColor={entry.fill} stopOpacity={0.55} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="4 6" stroke={gridStroke} vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: chartInk, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: chartInk }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatAxis}
                  width={42}
                />
                <Tooltip
                  formatter={(value: any) => [formatMoney(Number(value)), 'Amount']}
                  contentStyle={tooltipStyle}
                  cursor={{ fill: cursorFill, radius: 10 }}
                />
                <Bar dataKey="amount" radius={[12, 12, 6, 6]} maxBarSize={58} animationDuration={900}>
                  {comparisonData.map((entry) => (
                    <Cell key={entry.name} fill={`url(#bar-${entry.name})`} />
                  ))}
                  <LabelList
                    dataKey="amount"
                    position="top"
                    formatter={(v: any) => formatMoney(Number(v))}
                    style={{ fill: chartInk, fontSize: 10, fontWeight: 700 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Budget vs actual */}
        <Card delay={0.24}>
          <h3 className="font-display text-lg font-semibold flex items-center gap-2.5 mb-5">
            <TrendingUp className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            Budget vs actual
          </h3>
          <div className="h-72">
            {budgetVsActual.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-mist-500">
                No budgets set yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetVsActual} margin={{ top: 20, right: 8, left: -8, bottom: 4 }} barGap={6} barCategoryGap="18%">
                  <defs>
                    <linearGradient id="spentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={expenseFill} stopOpacity={1} />
                      <stop offset="100%" stopColor={expenseFill} stopOpacity={0.5} />
                    </linearGradient>
                    <linearGradient id="limitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={incomeFill} stopOpacity={1} />
                      <stop offset="100%" stopColor={incomeFill} stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 6" stroke={gridStroke} vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: chartInk, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: chartInk }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatAxis}
                    width={42}
                  />
                  <Tooltip
                    formatter={(value: any) => formatMoney(Number(value))}
                    contentStyle={tooltipStyle}
                    cursor={{ fill: cursorFill, radius: 8 }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: chartInk, paddingTop: 8 }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Bar dataKey="Spent" fill="url(#spentGrad)" radius={[8, 8, 4, 4]} maxBarSize={28} animationDuration={900} />
                  <Bar dataKey="Limit" fill="url(#limitGrad)" radius={[8, 8, 4, 4]} maxBarSize={28} animationDuration={900} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsView;
