import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  SlidersHorizontal,
  MoreVertical,
  PlusCircle,
  Sparkles,
  CreditCard,
  Receipt,
  Wallet,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
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
    totalIncome,
    totalExpense,
    netSavings,
  } = useFinance();

  const [bankAccount, setBankAccount] = useState('SBI');
  const [timeFilter, setTimeFilter] = useState('Recent');

  // Format currency helper
  const formatAmt = (num: number) =>
    `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. TOP 4 METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Account Balance */}
        <div className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xs hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                <Wallet className="w-4 h-4" />
              </div>
              <span>Account Balance</span>
            </div>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {formatAmt(totalIncome > 0 ? totalIncome : 898450)}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-[11px] font-extrabold border border-emerald-300/60">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
              6% more than last month
            </span>

            {/* Bank Badge */}
            <div className="relative inline-block">
              <select
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="appearance-none bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-[11px] font-bold px-2.5 py-1 pr-6 rounded-xl border border-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="SBI">SBI</option>
                <option value="HDFC">HDFC</option>
                <option value="ICICI">ICICI</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Card 2: Monthly Expenses */}
        <div className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xs hover:border-rose-300 transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/60">
                <Receipt className="w-4 h-4" />
              </div>
              <span>Monthly Expenses</span>
            </div>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {formatAmt(totalExpense > 0 ? totalExpense : 24093)}
            </div>
          </div>

          <div className="pt-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100/80 text-rose-800 text-[11px] font-extrabold border border-rose-300/60">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
              2% less than last month
            </span>
          </div>
        </div>

        {/* Card 3: Total Investment */}
        <div className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xs hover:border-teal-400 transition-all flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-teal-50 text-teal-600 border border-teal-200/60">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span>Total Investment</span>
            </div>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          {/* Mini Sparkline Curve */}
          <div className="h-8 w-full relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 25" preserveAspectRatio="none">
              <path
                d="M 0 20 Q 25 5, 50 15 T 100 2"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ₹1,45,555.00
            </div>
            <p className="text-[10px] font-semibold text-slate-400">
              Invest Amount ₹1,00,000.00
            </p>
          </div>
        </div>

        {/* Card 4: Goal Progress Target */}
        <div className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xs hover:border-emerald-400 transition-all flex items-center justify-between gap-3">
          {/* Left Donut Progress */}
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500"
                strokeDasharray="65, 100"
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-black text-slate-800">52%</span>
          </div>

          {/* Right Info */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
              <span>Goal</span>
              <MoreVertical className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs font-black text-slate-900 line-clamp-1">
              Apple iPhone 17 Pro
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              Required: ₹1,45,000
            </p>
            <p className="text-[10px] font-bold text-emerald-700">
              Collect: ₹75,000
            </p>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Expenses Capsule Bar Chart (7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
                <Receipt className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Monthly Expenses</h3>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                <ArrowUpRight className="w-3 h-3 text-emerald-600" /> 6% more than last month
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-2xl border border-slate-200 focus:outline-none"
              >
                <option value="Recent">Recent ∨</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </div>
          </div>

          {/* Capsule Vertical Bars Container */}
          <div className="pt-4 flex items-end justify-between h-52 px-2 sm:px-6 gap-2 sm:gap-4">
            {[
              { month: 'Dec', height: '60%', activeHeight: '40%' },
              { month: 'Feb', height: '90%', activeHeight: '85%' },
              { month: 'Mar', height: '90%', activeHeight: '28%' },
              { month: 'Apr', height: '90%', activeHeight: '52%' },
              { month: 'May', height: '85%', activeHeight: '75%' },
              { month: 'Jan', height: '85%', activeHeight: '70%' },
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full max-w-[36px] bg-emerald-100/60 rounded-2xl h-full flex items-end p-1 relative overflow-hidden">
                  <div
                    className="w-full bg-emerald-600 rounded-xl transition-all duration-500 hover:bg-emerald-500"
                    style={{ height: bar.activeHeight }}
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-500">{bar.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Category Donut Breakdown (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-teal-50 text-teal-600">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Top Category</h3>
            </div>

            <button className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl">
              Recent ∨
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* SVG Donut */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="6" strokeDasharray="30 100" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#14b8a6" strokeWidth="6" strokeDasharray="20 100" strokeDashoffset="-30" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#059669" strokeWidth="6" strokeDasharray="18 100" strokeDashoffset="-50" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#34d399" strokeWidth="6" strokeDasharray="14 100" strokeDashoffset="-68" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#06b6d4" strokeWidth="6" strokeDasharray="10 100" strokeDashoffset="-82" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#38bdf8" strokeWidth="6" strokeDasharray="8 100" strokeDashoffset="-92" />
              </svg>
            </div>

            {/* Legend List */}
            <div className="flex-1 space-y-1.5 w-full">
              {[
                { name: 'Food & Grocery', amt: '₹6,156.00', color: 'bg-emerald-600' },
                { name: 'Investment', amt: '₹5,000.00', color: 'bg-teal-500' },
                { name: 'Shopping', amt: '₹4,356.00', color: 'bg-emerald-500' },
                { name: 'Travelling', amt: '₹3,670.00', color: 'bg-emerald-400' },
                { name: 'Miscellaneous', amt: '₹2,749.00', color: 'bg-cyan-500' },
                { name: 'Bill & Subscription', amt: '₹2,162.00', color: 'bg-sky-400' },
              ].map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                    <span className="text-slate-600">{cat.name}</span>
                  </div>
                  <span className="font-extrabold text-slate-900">{cat.amt}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('analytics')}
            className="w-full py-2 rounded-2xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold transition-all"
          >
            More Details..
          </button>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: RECENT EXPENSES TABLE & BILL SUBSCRIPTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Expenses Table (8 Cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900">Recent Expenses</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateTab('transactions')}
                className="flex items-center gap-1 py-1 px-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-all"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filter
              </button>
              <button className="py-1 px-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                Recent ∨
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-3">S.N</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Sub Category</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {[
                  { sn: 1, amt: '₹2,100.00', cat: 'Shopping', sub: 'Amazon', date: '31 May 2026', mode: 'UPI' },
                  { sn: 2, amt: '₹299.00', cat: 'Movie', sub: 'PVR', date: '28 May 2026', mode: 'UPI' },
                  { sn: 3, amt: '₹5,000.00', cat: 'Investment', sub: 'Groww', date: '24 May 2026', mode: 'Bank' },
                  { sn: 4, amt: '₹2,460.00', cat: 'Travel', sub: 'IRCTC', date: '20 May 2026', mode: 'Card' },
                  { sn: 5, amt: '₹678.00', cat: 'Food', sub: 'Swiggy', date: '15 May 2026', mode: 'UPI' },
                ].map((row) => (
                  <tr key={row.sn} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 text-slate-400 font-bold">{row.sn}.</td>
                    <td className="py-3 font-extrabold text-slate-900">{row.amt}</td>
                    <td className="py-3 text-slate-700">{row.cat}</td>
                    <td className="py-3 text-slate-500">{row.sub}</td>
                    <td className="py-3 text-slate-500">{row.date}</td>
                    <td className="py-3">
                      <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-bold">
                        {row.mode}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bill & Subscription Widget (4 Cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900">Bill & Subscription</h3>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Netflix', date: '15 June 2026', amt: '₹149.00', bg: 'bg-rose-600' },
              { name: 'Spotify', date: '24 Aug 2026', amt: '₹49.00', bg: 'bg-emerald-600' },
              { name: 'Figma', date: '01 Jan 2026', amt: '₹3,999.00', bg: 'bg-purple-600' },
              { name: 'WiFi', date: '11 June 2026', amt: '₹399.00', bg: 'bg-rose-500' },
              { name: 'Electricity', date: '31 June 2026', amt: '₹1,265.00', bg: 'bg-blue-600' },
            ].map((bill, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-2xl ${bill.bg} text-white font-black text-xs flex items-center justify-center shadow-xs`}>
                    {bill.name[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{bill.name}</h4>
                    <p className="text-[10px] text-slate-400">{bill.date}</p>
                  </div>
                </div>
                <div className="text-xs font-extrabold text-slate-900">
                  {bill.amt}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

