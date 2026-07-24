import React, { useState } from 'react';
import { SavingsGoal } from '../../types';
import { Calculator, Sparkles, TrendingUp, Calendar, ArrowRight } from 'lucide-react';

interface WhatIfCalculatorProps {
  goals: SavingsGoal[];
}

export const WhatIfCalculator: React.FC<WhatIfCalculatorProps> = ({ goals }) => {
  const [extraAmount, setExtraAmount] = useState<number>(3000);

  const selectedGoal = goals[0] || {
    title: 'Home Down Payment',
    targetAmount: 3500000,
    currentAmount: 2240000,
    monthlyContribution: 45000,
  };

  const currentMonthly = selectedGoal.monthlyContribution || 20000;
  const newMonthly = currentMonthly + extraAmount;

  const remaining = Math.max(0, selectedGoal.targetAmount - selectedGoal.currentAmount);

  const currentMonths = Math.ceil(remaining / Math.max(1, currentMonthly));
  const newMonths = Math.ceil(remaining / Math.max(1, newMonthly));

  const monthsSaved = Math.max(0, currentMonths - newMonths);
  const totalExtraInvested = extraAmount * newMonths;

  // Estimated return advantage (~10% annual compounding effect over period)
  const compoundBonus = Math.round(totalExtraInvested * 0.18);

  const fmt = (v: number) => `₹${v.toLocaleString('en-IN')}`;

  return (
    <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <div className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60">
          <Calculator className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            AI What-If Growth Calculator
          </h3>
          <p className="text-xs text-slate-500">
            See how small increases in monthly savings compress your goal timeline
          </p>
        </div>
      </div>

      {/* Input controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:w-auto flex-1">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Additional Monthly Investment
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
              +₹
            </span>
            <input
              type="number"
              value={extraAmount}
              onChange={(e) => setExtraAmount(Number(e.target.value))}
              className="w-full pl-8 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-black text-slate-900"
              step="500"
              min="100"
            />
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex items-center gap-1.5 pt-4 sm:pt-5 w-full sm:w-auto">
          {[1000, 3000, 5000, 10000].map((preset) => (
            <button
              key={preset}
              onClick={() => setExtraAmount(preset)}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                extraAmount === preset
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              +₹{preset}
            </button>
          ))}
        </div>
      </div>

      {/* Impact Calculation Output Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-emerald-800">Time Saved</span>
          <div className="text-lg font-black text-emerald-900 flex items-center gap-1">
            <Calendar className="w-4 h-4 text-emerald-600" />
            {monthsSaved} Months Earlier
          </div>
          <p className="text-[10px] font-bold text-emerald-700">
            Target date compressed from {currentMonths} to {newMonths} months
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-teal-50/80 border border-teal-200/80 space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-teal-800">Compound Bonus</span>
          <div className="text-lg font-black text-teal-900 flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            +{fmt(compoundBonus)}
          </div>
          <p className="text-[10px] font-bold text-teal-700">
            Extra wealth generated from earlier compounding
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-100 via-teal-50 to-emerald-50 border border-emerald-200/80 text-slate-900 space-y-1 flex flex-col justify-between shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase text-emerald-800">
            New Monthly SIP
          </span>
          <div className="text-lg font-black text-slate-900">{fmt(newMonthly)}</div>
          <p className="text-[10px] font-bold text-slate-600">
            {selectedGoal.title}
          </p>
        </div>
      </div>
    </div>
  );
};
