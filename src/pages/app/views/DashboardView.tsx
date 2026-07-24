import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  TrendingUp, TrendingDown, PiggyBank, Zap, Sparkles, FileText,
  ShieldAlert, ArrowRight, Plus, Target, ArrowUpRight, ArrowDownLeft,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useFinance } from '../../../context/FinanceContext';
import { api } from '../../../services/api';
import { formatMoney } from '../../../utils/currency';
import { Counter } from '../../../components/motion/primitives';

const PERSONA_COPY: Record<string, { greeting: string; incomeLabel: string }> = {
  student: { greeting: 'Stretch every rupee — your habits are compounding.', incomeLabel: 'Monthly allowance' },
  professional: { greeting: 'Optimize, invest, repeat. Your goals are within reach.', incomeLabel: 'Total inflow' },
  family: { greeting: 'The household is on track. Keep the cash flow predictable.', incomeLabel: 'Household inflow' },
  senior: { greeting: 'Everything is steady. Your essentials are well covered.', incomeLabel: 'Pension & income' },
};

const stagger = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const Widget: React.FC<{ children: React.ReactNode; className?: string; index?: number }> = ({
  children,
  className = '',
  index = 0,
}) => (
  <motion.div
    variants={stagger}
    initial="hidden"
    animate="show"
    custom={index}
    className={`glass card-ring rounded-3xl ${className}`}
  >
    {children}
  </motion.div>
);

const SavingsRing: React.FC<{ rate: number }> = ({ rate }) => {
  const clamped = Math.min(100, Math.max(0, rate));
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-20 h-20" role="img" aria-label={`Savings rate ${rate} percent`}>
      <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <motion.circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * clamped) / 100 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-lg">
        {rate}%
      </span>
    </div>
  );
};

const DashboardView: React.FC<{ onOpenAdd: () => void }> = ({ onOpenAdd }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    transactions, budgets, goals, totalIncome, totalExpense,
    netSavings, savingsRate, essentialExpenseTotal,
  } = useFinance();

  const [reportBusy, setReportBusy] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [insightsBusy, setInsightsBusy] = useState(false);
  const [insights, setInsights] = useState<any>(null);

  const persona = currentUser?.persona || 'professional';
  const copy = PERSONA_COPY[persona];
  const overBudget = budgets.filter((b) => b.spent > b.limit);
  const recent = transactions.slice(0, 6);
  const topGoals = goals.slice(0, 2);
  const firstName = currentUser?.name?.split(' ')[0] || 'there';

  const generateReport = async () => {
    setReportBusy(true);
    try {
      const topCategories = [...budgets]
        .sort((a, b) => b.spent - a.spent)
        .slice(0, 3)
        .map((b) => ({ category: b.category, spent: b.spent }));
      const data = await api<any>('/api/ai/monthly-report', {
        method: 'POST',
        body: JSON.stringify({ persona, totalIncome, totalExpense, savingsRate, topCategories }),
      });
      setReport(data);
    } catch (e: any) {
      setReport({ headline: 'Report unavailable', executiveSummary: e?.message || 'AI is unavailable right now.', keyHighlights: [] });
    } finally {
      setReportBusy(false);
    }
  };

  const generateInsights = async () => {
    setInsightsBusy(true);
    try {
      const data = await api<any>('/api/ai/insights', { method: 'POST', body: JSON.stringify({}) });
      setInsights(data);
    } catch (e: any) {
      setInsights({ healthScore: null, statusSummary: e?.message || 'AI insights unavailable right now.', anomaliesDetected: [], savingsOpportunities: [] });
    } finally {
      setInsightsBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Greeting hero */}
      <Widget index={0} className="relative p-6 md:p-8 overflow-hidden">
        <div
          className="absolute -top-28 -right-28 w-72 h-72 rounded-full blur-3xl"
          style={{ background: 'var(--accent-soft)' }}
          aria-hidden
        />
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
              {persona} mode
            </p>
            <h1 className="font-display text-2xl md:text-4xl font-semibold tracking-tight">
              Hello, {firstName}.
            </h1>
            <p className="text-mist-500 text-sm md:text-base mt-2 max-w-lg">{copy.greeting}</p>
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={onOpenAdd}
              className="btn-accent px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add transaction
            </button>
            <button
              onClick={() => navigate('/app/coach')}
              className="glass px-5 py-3 rounded-2xl text-sm font-semibold hover:bg-white/8 transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" style={{ color: 'var(--accent)' }} /> Ask Coach
            </button>
          </div>
        </div>
      </Widget>

      {/* Over-budget alert */}
      {overBudget.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl border-rose-400/25 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          role="alert"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-300 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-rose-200">
                {overBudget.length} {overBudget.length === 1 ? 'budget' : 'budgets'} exceeded
              </p>
              <p className="text-xs text-mist-500">
                {overBudget.map((b) => `${b.category} (${formatMoney(b.spent)} / ${formatMoney(b.limit)})`).join(' · ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/app/budgets')}
            className="text-xs font-bold text-rose-300 hover:text-rose-200 flex items-center gap-1 shrink-0"
          >
            Adjust limits <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Widget index={1} className="p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-semibold text-mist-500 uppercase tracking-widest">{copy.incomeLabel}</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-400/12 text-emerald-300 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="font-display text-2xl md:text-3xl font-bold">
            <Counter value={totalIncome} prefix="₹" />
          </p>
          <p className="text-[11px] text-mist-500 mt-1.5">Current period</p>
        </Widget>

        <Widget index={2} className="p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-semibold text-mist-500 uppercase tracking-widest">Total outflow</span>
            <div className="w-9 h-9 rounded-xl bg-rose-400/12 text-rose-300 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="font-display text-2xl md:text-3xl font-bold">
            <Counter value={totalExpense} prefix="₹" />
          </p>
          <p className="text-[11px] text-mist-500 mt-1.5">Essentials: {formatMoney(essentialExpenseTotal)}</p>
        </Widget>

        <Widget index={3} className="p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-semibold text-mist-500 uppercase tracking-widest">Net savings</span>
            <div className="w-9 h-9 rounded-xl bg-teal-400/12 text-teal-300 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <p className={`font-display text-2xl md:text-3xl font-bold ${netSavings < 0 ? 'text-rose-300' : ''}`}>
            <Counter value={netSavings} prefix="₹" />
          </p>
          <p className="text-[11px] text-mist-500 mt-1.5">
            {netSavings >= 0 ? 'Positive cash flow' : 'Deficit — review spending'}
          </p>
        </Widget>

        <Widget index={4} className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-mist-500 uppercase tracking-widest block mb-3">
              Savings rate
            </span>
            <p className="text-[11px] text-mist-500 max-w-[7rem] leading-snug">
              {savingsRate >= 20 ? 'Excellent momentum' : savingsRate >= 10 ? 'Solid — aim for 20%' : 'Room to improve'}
            </p>
          </div>
          <SavingsRing rate={savingsRate} />
        </Widget>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Budgets widget */}
        <Widget index={5} className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-lg font-semibold">Budget health</h3>
            <button
              onClick={() => navigate('/app/budgets')}
              className="text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all"
              style={{ color: 'var(--accent)' }}
            >
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {budgets.length === 0 ? (
            <p className="text-sm text-mist-500 py-6 text-center">
              No budgets yet — create them manually or let AI build a starter plan.
            </p>
          ) : (
            <div className="space-y-5">
              {budgets.slice(0, 5).map((b, i) => {
                const pct = Math.min(100, Math.round((b.spent / Math.max(1, b.limit)) * 100));
                const over = b.spent > b.limit;
                const warn = pct >= 80 && !over;
                return (
                  <div key={b.category}>
                    <div className="flex justify-between items-baseline text-sm mb-2">
                      <span className="font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color || '#34d399' }} />
                        {b.category}
                      </span>
                      <span className={`text-xs font-semibold ${over ? 'text-rose-300' : 'text-mist-500'}`}>
                        {formatMoney(b.spent)} / {formatMoney(b.limit)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/6 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          over ? 'bg-rose-400' : warn ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.3 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Goals mini-strip */}
          {topGoals.length > 0 && (
            <div className="mt-7 pt-6 border-t hairline">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Target className="w-4 h-4" style={{ color: 'var(--accent)' }} /> Active goals
                </h4>
                <button
                  onClick={() => navigate('/app/goals')}
                  className="text-xs font-semibold flex items-center gap-1"
                  style={{ color: 'var(--accent)' }}
                >
                  All goals <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {topGoals.map((g) => {
                  const pct = Math.min(100, Math.round((g.currentAmount / Math.max(1, g.targetAmount)) * 100));
                  return (
                    <div key={g.id} className="glass rounded-2xl p-4">
                      <p className="text-sm font-semibold truncate mb-1">{g.title}</p>
                      <p className="text-xs text-mist-500 mb-3">
                        {formatMoney(g.currentAmount)} of {formatMoney(g.targetAmount)}
                      </p>
                      <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: 'var(--accent)' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Widget>

        {/* AI panel */}
        <Widget index={6} className="p-6 flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl btn-accent flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="font-display text-lg font-semibold">AI insights</h3>
            </div>
            {insights ? (
              <div className="space-y-3">
                {insights.healthScore != null && (
                  <div className="flex items-center justify-between glass rounded-2xl px-4 py-3">
                    <span className="text-xs font-semibold text-mist-500 uppercase tracking-widest">Health score</span>
                    <span className="font-display text-xl font-bold" style={{ color: 'var(--accent)' }}>
                      {insights.healthScore}/100
                    </span>
                  </div>
                )}
                <p className="text-sm text-mist-300 leading-relaxed">{insights.statusSummary}</p>
                {Array.isArray(insights.savingsOpportunities) && insights.savingsOpportunities.length > 0 && (
                  <ul className="space-y-2">
                    {insights.savingsOpportunities.slice(0, 3).map((tip: string, i: number) => (
                      <li key={i} className="text-xs text-mist-500 flex gap-2">
                        <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                        {tip}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <button
                onClick={generateInsights}
                disabled={insightsBusy}
                className="w-full glass hover:bg-white/8 py-3.5 rounded-2xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {insightsBusy ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                    Analyzing patterns…
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" style={{ color: 'var(--accent)' }} /> Run spending insights
                  </>
                )}
              </button>
            )}
          </div>

          <div className="pt-5 border-t hairline">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl glass flex items-center justify-center">
                <FileText className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="font-display text-lg font-semibold">Monthly report</h3>
            </div>
            {report ? (
              <div className="space-y-2.5">
                <p className="text-sm font-bold">{report.headline}</p>
                <p className="text-sm text-mist-300 leading-relaxed">{report.executiveSummary}</p>
                {Array.isArray(report.keyHighlights) && report.keyHighlights.length > 0 && (
                  <ul className="space-y-1.5">
                    {report.keyHighlights.map((h: string, i: number) => (
                      <li key={i} className="text-xs text-mist-500 flex gap-2">
                        <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--accent)' }} />
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <button
                onClick={generateReport}
                disabled={reportBusy}
                className="w-full glass hover:bg-white/8 py-3.5 rounded-2xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {reportBusy ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                    Writing your report…
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" style={{ color: 'var(--accent)' }} /> Generate AI report
                  </>
                )}
              </button>
            )}
          </div>
        </Widget>
      </div>

      {/* Recent activity */}
      <Widget index={7} className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg font-semibold">Recent activity</h3>
          <button
            onClick={() => navigate('/app/transactions')}
            className="text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all"
            style={{ color: 'var(--accent)' }}
          >
            All {transactions.length} transactions <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-mist-500 py-6 text-center">No transactions yet — add your first one.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {recent.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className="flex items-center gap-4 py-3.5"
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    tx.type === 'income' ? 'bg-emerald-400/12 text-emerald-300' : 'bg-white/6 text-mist-300'
                  }`}
                >
                  {tx.type === 'income' ? <ArrowDownLeft className="w-4.5 h-4.5" /> : <ArrowUpRight className="w-4.5 h-4.5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{tx.title}</p>
                  <p className="text-xs text-mist-500">
                    {tx.category} · {tx.date}
                  </p>
                </div>
                <p className={`font-display font-bold text-sm ${tx.type === 'income' ? 'text-emerald-300' : ''}`}>
                  {tx.type === 'income' ? '+' : '−'}
                  {formatMoney(tx.amount)}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </Widget>
    </div>
  );
};

export default DashboardView;
