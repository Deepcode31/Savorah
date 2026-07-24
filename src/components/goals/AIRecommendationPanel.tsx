import React, { useState } from 'react';
import { SavingsGoal } from '../../types';
import { Sparkles, ArrowRight, CheckCircle2, TrendingUp, Zap } from 'lucide-react';

interface AIRecommendationPanelProps {
  goals: SavingsGoal[];
  onApplyRecommendation: (goalId: string, extraMonthly: number) => void;
}

export const AIRecommendationPanel: React.FC<AIRecommendationPanelProps> = ({
  goals,
  onApplyRecommendation,
}) => {
  const [applied, setApplied] = useState<Record<string, boolean>>({});

  const primaryGoal = goals[0] || { id: 'sg-1', title: 'Home Goal', monthlyContribution: 10000 };
  const secondaryGoal = goals[1] || { id: 'sg-2', title: 'Vacation Goal', monthlyContribution: 5000 };

  const recommendations = [
    {
      id: primaryGoal.id,
      goalTitle: primaryGoal.title,
      text: `Increase your monthly investment by ₹1,200 to reach your ${primaryGoal.title} 5 months earlier.`,
      extraMonthly: 1200,
      impact: 'Accelerates target date to Jan 2027',
      tag: 'High Impact',
    },
    {
      id: secondaryGoal.id,
      goalTitle: secondaryGoal.title,
      text: `Reducing Food & Dining expenses by 8% can fully fund your ${secondaryGoal.title} 3 months ahead of time.`,
      extraMonthly: 800,
      impact: 'Saves ₹2,400 in interest returns',
      tag: 'Cash Flow Boost',
    },
  ];

  const handleApply = (recId: string, extra: number) => {
    onApplyRecommendation(recId, extra);
    setApplied((prev) => ({ ...prev, [recId]: true }));
  };

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50/90 via-teal-50/70 to-emerald-100/50 border border-emerald-200/80 shadow-xs space-y-4 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between border-b border-emerald-200/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-emerald-600 text-white font-black shadow-xs">
            <Sparkles className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h3 className="text-base font-extrabold tracking-tight text-slate-900">
              AI Financial Planner Recommendations
            </h3>
            <p className="text-xs font-semibold text-emerald-800">
              Personalized goal acceleration strategies powered by Savorah AI
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-extrabold">
          <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
          Live Auto-Optimization
        </span>
      </div>

      {/* Recommendations Cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec) => {
          const isApplied = applied[rec.id];

          return (
            <div
              key={rec.id}
              className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-emerald-200/80 space-y-3 flex flex-col justify-between hover:border-emerald-300 shadow-2xs transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-extrabold">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {rec.tag}
                  </span>
                  <span className="text-emerald-700 font-bold">{rec.impact}</span>
                </div>
                <p className="text-xs font-semibold leading-relaxed text-slate-800 pt-1">
                  "{rec.text}"
                </p>
              </div>

              {isApplied ? (
                <div className="py-2 px-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 font-extrabold text-xs flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Recommendation Applied (+₹{rec.extraMonthly}/mo)
                </div>
              ) : (
                <button
                  onClick={() => handleApply(rec.id, rec.extraMonthly)}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-white" />
                  ✨ Apply Recommendation
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
