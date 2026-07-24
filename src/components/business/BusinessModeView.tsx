import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  AlertTriangle,
  Clock,
  Plus,
  Receipt,
  FileCheck2,
  Zap,
} from 'lucide-react';

export const BusinessModeView: React.FC = () => {
  const { totalIncome, totalExpense, netSavings } = useFinance();

  const [invoices, setInvoices] = useState([
    { id: 'inv-1', vendor: 'AWS Cloud Hosting Services', amount: 1250, dueDate: '2026-08-01', status: 'Pending' },
    { id: 'inv-2', vendor: 'WeWork Office Space Subscriptions', amount: 3400, dueDate: '2026-08-05', status: 'Paid' },
    { id: 'inv-3', vendor: 'Google Workspace & SaaS Tools', amount: 820, dueDate: '2026-08-10', status: 'Pending' },
    { id: 'inv-4', vendor: 'Payroll Operations & Contractors', amount: 14200, dueDate: '2026-08-15', status: 'Pending' },
  ]);

  const [newVendor, setNewVendor] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  const handleAddInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendor.trim() || !newAmount) return;

    setInvoices([
      ...invoices,
      {
        id: `inv-${Date.now()}`,
        vendor: newVendor,
        amount: Number(newAmount) || 0,
        dueDate: newDueDate || '2026-08-30',
        status: 'Pending',
      },
    ]);

    setNewVendor('');
    setNewAmount('');
    setNewDueDate('');
  };

  const toggleInvoiceStatus = (id: string) => {
    setInvoices(
      invoices.map((inv) =>
        inv.id === id
          ? { ...inv, status: inv.status === 'Paid' ? 'Pending' : 'Paid' }
          : inv
      )
    );
  };

  // Business calculations
  const grossMonthlyRevenue = totalIncome + 12500; // adding business revenue stream
  const operationalCosts = totalExpense + 6400; // operational overhead
  const netOperatingProfit = grossMonthlyRevenue - operationalCosts;

  const currentCashReserve = 85000;
  const burnRate = operationalCosts;
  const cashRunwayMonths = Math.round((currentCashReserve / Math.max(1, burnRate)) * 10) / 10;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-800 to-emerald-900 text-white shadow-xl shadow-emerald-950/15 space-y-3 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-emerald-200 text-xs font-bold">
            <Building2 className="w-3.5 h-3.5 text-emerald-300" />
            BUSINESS & ENTERPRISE CASH FLOW MONITORING
          </div>
          <span className="text-xs text-emerald-200/80 font-mono">Real-Time Operational Engine</span>
        </div>

        <h2 className="text-2xl font-extrabold tracking-tight text-white">
          Enterprise Operations & Runway Dashboard
        </h2>
        <p className="text-xs text-emerald-100/90 max-w-2xl leading-relaxed">
          Monitor operational costs, vendor accounts payable, cash burn rate, and real-time cash flow runway for your organization.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Gross Monthly Revenue
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ₹{grossMonthlyRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">
            +14.2% vs last month
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Operational Outflow (OPEX)
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ₹{operationalCosts.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Payroll, SaaS, Office, Cloud
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Net Operating Profit
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            ₹{netOperatingProfit.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
            Positive Cash Margin
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Cash Runway Buffer
          </span>
          <div className="text-2xl font-black text-teal-700 mt-1">
            {cashRunwayMonths} Months
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Based on ₹85k cash reserve
          </p>
        </div>
      </div>

      {/* Operational Invoices & Accounts Payable */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice List */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900">
              Vendor Invoices & Accounts Payable
            </h3>
            <span className="text-xs font-bold text-slate-500">
              {invoices.filter((i) => i.status === 'Pending').length} Pending Approval
            </span>
          </div>

          <div className="space-y-2.5">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-4 rounded-2xl bg-slate-50/80 hover:bg-slate-100/80 transition-all flex items-center justify-between gap-4 border border-slate-200/60"
              >
                <div>
                  <div className="font-extrabold text-xs text-slate-900">{inv.vendor}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>Due: {inv.dueDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-black text-xs text-slate-900">
                      ₹{inv.amount.toLocaleString()}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleInvoiceStatus(inv.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      inv.status === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {inv.status}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Vendor Form */}
        <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100">
            Log Vendor Operational Bill
          </h3>

          <form onSubmit={handleAddInvoice} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vendor Name
              </label>
              <input
                type="text"
                placeholder="e.g. Figma Enterprise or Azure Hosting"
                value={newVendor}
                onChange={(e) => setNewVendor(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bill Amount (₹)
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md"
            >
              Add Payable Invoice
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
