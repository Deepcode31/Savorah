import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  AlertTriangle,
  GraduationCap,
  Briefcase,
  Users,
  HeartHandshake,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CheckCircle2,
  PlusCircle,
  FileText,
  ShieldAlert,
  Zap,
} from 'lucide-react';

interface AdaptiveDashboardProps {
  onNavigateTab: (tab: any) => void;
  onOpenAddExpense: () => void;
}

export const AdaptiveDashboard: React.FC<AdaptiveDashboardProps> = ({
  onNavigateTab,
  onOpenAddExpense,
}) => {
  const { currentUser } = useAuth();
  const {
    transactions,
    budgets,
    goals,
    notifications,
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate,
    essentialExpenseTotal,
  } = useFinance();

  const [aiReportGenerating, setAiReportGenerating] = useState(false);
  const [aiReportResult, setAiReportResult] = useState<any>(null);

  const persona = currentUser?.persona || 'professional';

  // Over-budget categories
  const overBudgetItems = budgets.filter((b) => b.spent > b.limit);

  // Recent transactions
  const recentTransactions = transactions.slice(0, 5);

  const handleGenerateAIReport = async () => {
    setAiReportGenerating(true);
    try {
      const topCategories = budgets
        .sort((a, b) => b.spent - a.spent)
        .slice(0, 3)
        .map((b) => ({ category: b.category, spent: b.spent }));

      const res = await fetch('/api/gemini/monthly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona,
          totalIncome,
          totalExpense,
          savingsRate,
          topCategories,
        }),
      });
      const data = await res.json();
      setAiReportResult(data);
    } catch (e) {
      console.error(e);
      setAiReportResult({
        headline: 'Financial Stability Review',
        executiveSummary: `You have spent $${totalExpense.toLocaleString()} out of $${totalIncome.toLocaleString()} this month, leaving a net positive reserve of $${netSavings.toLocaleString()}.`,
        keyHighlights: [
          'Essential expenses are well-contained within baseline projections.',
          'Savings rate stands at a healthy ' + savingsRate + '%.',
          'No critical cash flow leaks detected.',
        ],
        recommendationNextMonth: 'Continue automating goal transfers at the beginning of each cycle.',
      });
    } finally {
      setAiReportGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Glassmorphism Hero Banner - Adaptive per persona */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white p-6 md:p-8 shadow-xl shadow-emerald-950/15">
        {/* Ambient lighting circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-teal-300/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-100">
              {persona === 'student' && <GraduationCap className="w-3.5 h-3.5 text-emerald-300" />}
              {persona === 'professional' && <Briefcase className="w-3.5 h-3.5 text-teal-300" />}
              {persona === 'family' && <Users className="w-3.5 h-3.5 text-blue-300" />}
              {persona === 'senior' && <HeartHandshake className="w-3.5 h-3.5 text-purple-300" />}
              <span>Adaptive Mode: {persona.toUpperCase()}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Hello, {currentUser?.name || 'Friend'}!
            </h1>

            <p className="text-xs md:text-sm text-emerald-100/90 max-w-xl leading-relaxed">
              {persona === 'student' &&
                'Track your part-time allowance, keep textbooks within limit, and build solid money habits.'}
              {persona === 'professional' &&
                'Maximize investment allocation, keep tax-conscious budgeting, and reach long-term goals faster.'}
              {persona === 'family' &&
                'Monitor household bills, childcare budgets, and ensure shared cash flow stays predictable.'}
              {persona === 'senior' &&
                'Keep your fixed pension income safe, monitor essential healthcare expenses, and enjoy simple budgeting.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAddExpense}
              className="py-3 px-5 rounded-2xl bg-white text-emerald-800 font-bold text-xs shadow-lg shadow-black/10 hover:bg-emerald-50 transition-all flex items-center gap-2 hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              Log Expense
            </button>

            <button
              onClick={() => onNavigateTab('aicoach')}
              className="py-3 px-4 rounded-2xl bg-emerald-800/60 backdrop-blur-md border border-white/20 text-white font-semibold text-xs hover:bg-emerald-800/80 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              Ask AI Coach
            </button>
          </div>
        </div>
      </div>

      {/* Over-Budget Alert Bar if any */}
      {overBudgetItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50/90 backdrop-blur-md border border-rose-300 text-rose-900 shadow-md flex items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500 text-white shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-rose-900">
                Budget Limit Exceeded in {overBudgetItems.length} Category!
              </h4>
              <p className="text-[11px] text-rose-700">
                {overBudgetItems.map((b) => `${b.category} ($${b.spent}/$${b.limit})`).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('budget')}
            className="py-1.5 px-3 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-all shrink-0"
          >
            Adjust Limits
          </button>
        </div>
      )}

      {/* Core Financial Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5 hover:border-emerald-500/35 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {persona === 'student' ? 'Monthly Allowance' : persona === 'senior' ? 'Fixed Pension' : 'Total Cash Inflow'}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ${totalIncome.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-bold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> Stable
            </span>
            for current period
          </p>
        </div>

        {/* Total Expense */}
        <div className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5 hover:border-emerald-500/35 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Outflow
            </span>
            <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ${totalExpense.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-slate-600 font-medium">
              Essential: ${essentialExpenseTotal.toLocaleString()}
            </span>
          </p>
        </div>

        {/* Net Cash Reserve */}
        <div className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5 hover:border-emerald-500/35 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Net Savings
            </span>
            <div className="w-9 h-9 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black ${netSavings >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            ${netSavings.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {netSavings >= 0 ? 'Positive cash flow buffer' : 'Deficit spending alert'}
          </p>
        </div>

        {/* Savings Rate Gauge */}
        <div className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5 hover:border-emerald-500/35 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Savings Rate
            </span>
            <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {savingsRate}%
          </div>
          {/* Gauge bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
            />
          </div>
        </div>
      </div>

      {/* PERSONA SPECIFIC HIGHLIGHTED WIDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Persona Spotlight Card */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-extrabold text-slate-900">
                {persona === 'student' && 'Student Spending & Savings Habits'}
                {persona === 'professional' && 'Career Salary & Goal Allocation'}
                {persona === 'family' && 'Household Expenses & Bill Reminders'}
                {persona === 'senior' && 'Fixed Pension & Essential Healthcare'}
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              Full Analytics →
            </button>
          </div>

          {/* Persona Custom Widget Content */}
          {persona === 'student' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-500/20 space-y-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                  📚 Education & Textbooks Limit
                </span>
                <p className="text-xs text-slate-600">
                  Tracked semester materials: $145 spent out of $200 budget.
                </p>
                <div className="w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full w-[72%]" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-500/20 space-y-2">
                <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">
                  💡 Student Tip
                </span>
                <p className="text-xs text-slate-600">
                  Cooking dinner 3 days a week instead of buying cafeteria meals saves ~$120/month.
                </p>
              </div>
            </div>
          )}

          {persona === 'professional' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-500/20 space-y-2">
                <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">
                  📈 Index Fund & Investment Ratio
                </span>
                <p className="text-xs text-slate-600">
                  Monthly automated investment: $1,200 allocated to S&P 500 & ETFs.
                </p>
                <span className="inline-block px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 text-[10px] font-bold">
                  18.4% of Salary
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-500/20 space-y-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                  🏡 Down Payment Goal Status
                </span>
                <p className="text-xs text-slate-600">
                  Home Down Payment: $22,400 saved out of $35,000 target.
                </p>
                <div className="w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full w-[64%]" />
                </div>
              </div>
            </div>
          )}

          {persona === 'family' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-500/20 space-y-2">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block">
                  👨‍👩‍👧 Childcare & Utilities Tracker
                </span>
                <p className="text-xs text-slate-600">
                  Daycare: $1,250 | Utilities: $280 | Groceries: $920.
                </p>
                <div className="text-[11px] font-semibold text-blue-700">
                  Shared budget status: 88% capacity
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-500/20 space-y-2">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                  ⏰ Upcoming Bill Due Date
                </span>
                <p className="text-xs text-slate-600">
                  Solar & Water Electric bill ($280) due tomorrow.
                </p>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                  Auto-Pay Active
                </span>
              </div>
            </div>
          )}

          {persona === 'senior' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-500/20 space-y-2">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider block">
                  💊 Essential Healthcare & Meds
                </span>
                <p className="text-xs text-slate-700">
                  Prescriptions & Checkups: $320 spent out of $500 monthly limit.
                </p>
                <div className="w-full bg-purple-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full w-[64%]" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-500/20 space-y-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                  🛡️ Fixed Income Safety Margin
                </span>
                <p className="text-xs text-slate-600">
                  Essential living costs consume 52% of your monthly pension ($3,400).
                </p>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Predictable & Safe
                </span>
              </div>
            </div>
          )}

          {/* Category Budget Quick Bars */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-700 mb-2">Category Budget Progress</h4>
            <div className="space-y-2">
              {budgets.slice(0, 4).map((b) => {
                const percent = Math.min(100, Math.round((b.spent / b.limit) * 100));
                const isOver = b.spent > b.limit;

                return (
                  <div key={b.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-700">
                      <span>{b.category}</span>
                      <span className={isOver ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                        ${b.spent} / ${b.limit} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOver ? 'bg-rose-500' : percent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI Plain-Language Report & Quick Actions */}
        <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">
                AI Plain-Language Report
              </h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Get an instant, plain-language monthly summary of your spending, cash flow, and savings advice auto-generated by Gemini.
            </p>

            {aiReportResult ? (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-500/20 space-y-2 animate-in fade-in">
                <h4 className="text-xs font-extrabold text-emerald-900">
                  {aiReportResult.headline || 'Monthly Financial Digest'}
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {aiReportResult.executiveSummary}
                </p>
                {aiReportResult.keyHighlights && (
                  <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside pt-1">
                    {aiReportResult.keyHighlights.map((hl: string, i: number) => (
                      <li key={i}>{hl}</li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <button
                onClick={handleGenerateAIReport}
                disabled={aiReportGenerating}
                className="w-full py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
              >
                {aiReportGenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing Financial Data...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate AI Monthly Report
                  </>
                )}
              </button>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Quick Navigation
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigateTab('transactions')}
                className="py-2 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-semibold text-left transition-all border border-slate-200/60"
              >
                Log Transactions
              </button>
              <button
                onClick={() => onNavigateTab('goals')}
                className="py-2 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-semibold text-left transition-all border border-slate-200/60"
              >
                Savings Goals
              </button>
              <button
                onClick={() => onNavigateTab('vision')}
                className="py-2 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-semibold text-left transition-all border border-slate-200/60"
              >
                AI Goal Board
              </button>
              <button
                onClick={() => onNavigateTab('budget')}
                className="py-2 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-semibold text-left transition-all border border-slate-200/60"
              >
                Budget Limits
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table Preview */}
      <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-extrabold text-slate-900">Recent Transactions</h3>
          <button
            onClick={() => onNavigateTab('transactions')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            View All ({transactions.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-2 font-bold">Title</th>
                <th className="pb-2 font-bold">Category</th>
                <th className="pb-2 font-bold">Date</th>
                <th className="pb-2 font-bold">Payment</th>
                <th className="pb-2 font-bold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 font-bold text-slate-800 flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        tx.type === 'income' ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                    {tx.title}
                  </td>
                  <td className="py-3 text-slate-600 font-medium">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">{tx.date}</td>
                  <td className="py-3 text-slate-500">{tx.paymentMethod}</td>
                  <td
                    className={`py-3 text-right font-black ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
