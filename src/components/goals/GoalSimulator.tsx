import React, { useState } from 'react';
import { goalPredictionService } from '../../services/goalPredictionService';
import { Sliders, TrendingUp, Calendar, Zap, DollarSign } from 'lucide-react';

export const GoalSimulator: React.FC = () => {
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(15000);
  const [returnRate, setReturnRate] = useState<number>(12);
  const [inflationRate, setInflationRate] = useState<number>(5);
  const [timeYears, setTimeYears] = useState<number>(5);

  const initialAmount = 50000;

  const result = goalPredictionService.calculateFutureValue(
    initialAmount,
    monthlyDeposit,
    returnRate,
    inflationRate,
    timeYears
  );

  const fmt = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200/60">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Smart Goal Simulator & Growth Engine
            </h3>
            <p className="text-xs text-slate-500">
              Simulate compounding returns, inflation drag, and future wealth creation in real time
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-300">
          <Zap className="w-3.5 h-3.5 text-emerald-600" />
          Real-Time Projections
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Column (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Slider 1: Monthly Contribution */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <label className="text-slate-700">Monthly Contribution (SIP)</label>
              <span className="text-emerald-700 font-extrabold">{fmt(monthlyDeposit)}/mo</span>
            </div>
            <input
              type="range"
              min="1000"
              max="100000"
              step="1000"
              value={monthlyDeposit}
              onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
              className="w-full accent-emerald-600 bg-slate-100 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
              <span>₹1,000</span>
              <span>₹50,000</span>
              <span>₹100,000</span>
            </div>
          </div>

          {/* Slider 2: Expected Return Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <label className="text-slate-700">Expected Annual Return (%)</label>
              <span className="text-teal-700 font-extrabold">{returnRate}% p.a.</span>
            </div>
            <input
              type="range"
              min="4"
              max="20"
              step="0.5"
              value={returnRate}
              onChange={(e) => setReturnRate(Number(e.target.value))}
              className="w-full accent-teal-600 bg-slate-100 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
              <span>4% (FD)</span>
              <span>12% (Equity MF)</span>
              <span>20% (High Growth)</span>
            </div>
          </div>

          {/* Slider 3: Inflation Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <label className="text-slate-700">Estimated Inflation (%)</label>
              <span className="text-amber-700 font-extrabold">{inflationRate}% p.a.</span>
            </div>
            <input
              type="range"
              min="2"
              max="10"
              step="0.5"
              value={inflationRate}
              onChange={(e) => setInflationRate(Number(e.target.value))}
              className="w-full accent-amber-600 bg-slate-100 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
              <span>2%</span>
              <span>5% (Avg)</span>
              <span>10%</span>
            </div>
          </div>

          {/* Slider 4: Time Horizon */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <label className="text-slate-700">Investment Horizon (Years)</label>
              <span className="text-purple-700 font-extrabold">{timeYears} Years</span>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              step="1"
              value={timeYears}
              onChange={(e) => setTimeYears(Number(e.target.value))}
              className="w-full accent-purple-600 bg-slate-100 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
              <span>1 Yr</span>
              <span>10 Yrs</span>
              <span>25 Yrs</span>
            </div>
          </div>
        </div>

        {/* Results Panel Column (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50/80 to-emerald-100/60 border border-emerald-200/90 text-slate-900 space-y-4 flex flex-col justify-between shadow-xs">
          <div className="space-y-3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800">
              Simulated Future Value
            </span>

            <div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                {fmt(result.futureValue)}
              </div>
              <p className="text-xs text-emerald-800 font-semibold mt-1">
                Estimated completion: <strong className="text-slate-900">{result.estimatedCompletionDate}</strong>
              </p>
            </div>

            {/* Breakdown Stack */}
            <div className="space-y-2 pt-2 border-t border-emerald-200/80">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600">Principal Invested:</span>
                <span className="font-extrabold text-slate-900">{fmt(result.totalInvested)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-emerald-800 font-bold">Compound Growth:</span>
                <span className="font-extrabold text-emerald-700">+{fmt(result.totalGrowth)}</span>
              </div>
            </div>

            {/* Visual Ratio Bar */}
            <div className="space-y-1 pt-1">
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                <div
                  className="bg-teal-600 h-full transition-all"
                  style={{
                    width: `${Math.round((result.totalInvested / result.futureValue) * 100)}%`,
                  }}
                />
                <div
                  className="bg-emerald-500 h-full transition-all"
                  style={{
                    width: `${Math.round((result.totalGrowth / result.futureValue) * 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-extrabold text-slate-600">
                <span>Principal ({Math.round((result.totalInvested / result.futureValue) * 100)}%)</span>
                <span className="text-emerald-700">Growth ({Math.round((result.totalGrowth / result.futureValue) * 100)}%)</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/90 border border-emerald-200/80 text-xs text-slate-700 leading-snug shadow-2xs">
            💡 <strong className="text-emerald-950">Smart AI Insight:</strong> Raising return from 12% to 14% adds <strong className="text-emerald-800">+{fmt(Math.round(result.totalGrowth * 0.22))}</strong> in future wealth.
          </div>
        </div>
      </div>
    </div>
  );
};
