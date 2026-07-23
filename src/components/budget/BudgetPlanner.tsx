import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { CATEGORY_COLORS } from '../../data/initialData';
import {
  Sliders,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Save,
  DollarSign,
  PieChart,
} from 'lucide-react';

export const BudgetPlanner: React.FC = () => {
  const { budgets, updateBudgetLimit } = useFinance();
  const { currentUser } = useAuth();

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [tempLimit, setTempLimit] = useState<string>('');

  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  const persona = currentUser?.persona || 'professional';

  const handleStartEdit = (category: string, currentLimit: number) => {
    setEditingCategory(category);
    setTempLimit(currentLimit.toString());
  };

  const handleSaveEdit = (category: string) => {
    const val = Number(tempLimit);
    if (!isNaN(val) && val >= 0) {
      updateBudgetLimit(category, val);
    }
    setEditingCategory(null);
  };

  const handleGenerateAIBudget = async () => {
    setAiGenerating(true);
    try {
      const res = await fetch('/api/gemini/budget-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona,
          monthlyIncome: currentUser?.monthlyIncome || 4000,
        }),
      });
      const data = await res.json();
      setAiResult(data);

      if (data.recommendedBudgets && Array.isArray(data.recommendedBudgets)) {
        data.recommendedBudgets.forEach((rb: any) => {
          if (rb.category && rb.recommendedLimit) {
            updateBudgetLimit(rb.category, rb.recommendedLimit);
          }
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiGenerating(false);
    }
  };

  const totalLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const totalRemaining = totalLimit - totalSpent;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Category Budget Limits & Planner
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Set custom spending thresholds or let Gemini AI optimize starter budgets based on your profile.
          </p>
        </div>

        <button
          onClick={handleGenerateAIBudget}
          disabled={aiGenerating}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all shrink-0"
        >
          {aiGenerating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating AI Plan...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              AI Auto-Generate Starter Budget
            </>
          )}
        </button>
      </div>

      {/* AI Recommendation Result Panel if generated */}
      {aiResult && (
        <div className="p-6 rounded-3xl bg-emerald-50/80 backdrop-blur-xl border border-emerald-500/30 text-emerald-900 shadow-lg space-y-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-extrabold text-emerald-950">
              Gemini Recommended Budget Allocation applied for {persona.toUpperCase()}!
            </h3>
          </div>
          {aiResult.topAdvice && (
            <ul className="text-xs text-emerald-800 space-y-1 list-disc list-inside">
              {aiResult.topAdvice.map((tip: string, i: number) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Budget Overview Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Total Budget Limit
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ${totalLimit.toLocaleString()}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Total Spent
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ${totalSpent.toLocaleString()}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Remaining Budget
          </span>
          <div
            className={`text-2xl font-black mt-1 ${
              totalRemaining >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            ${totalRemaining.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Category Budget Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((b) => {
          const percent = Math.min(100, Math.round((b.spent / b.limit) * 100));
          const isOver = b.spent > b.limit;
          const isWarning = percent >= 80 && !isOver;

          const catColorObj =
            CATEGORY_COLORS.find((c) => c.name === b.category) || CATEGORY_COLORS[0];

          return (
            <div
              key={b.category}
              className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5 space-y-3 hover:border-emerald-500/35 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: b.color || catColorObj.color }}
                  />
                  <h4 className="text-sm font-bold text-slate-900">{b.category}</h4>
                </div>

                {editingCategory === b.category ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={tempLimit}
                      onChange={(e) => setTempLimit(e.target.value)}
                      className="w-20 px-2 py-1 rounded-lg bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800"
                    />
                    <button
                      onClick={() => handleSaveEdit(b.category)}
                      className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartEdit(b.category, b.limit)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center gap-1 text-xs font-semibold"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Limit
                  </button>
                )}
              </div>

              {/* Status amounts */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>
                  Spent: <strong className="text-slate-900">${b.spent}</strong>
                </span>
                <span>
                  Limit: <strong className="text-slate-900">${b.limit}</strong>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* Warning or status label */}
              <div className="flex items-center justify-between text-[11px] font-medium">
                <span
                  className={
                    isOver
                      ? 'text-rose-600 font-bold flex items-center gap-1'
                      : isWarning
                      ? 'text-amber-600 font-bold flex items-center gap-1'
                      : 'text-emerald-700 font-bold flex items-center gap-1'
                  }
                >
                  {isOver && (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" />
                      Exceeded by ${(b.spent - b.limit).toLocaleString()}
                    </>
                  )}
                  {isWarning && (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" />
                      Near limit ({percent}%)
                    </>
                  )}
                  {!isOver && !isWarning && (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      On Track (${b.limit - b.spent} remaining)
                    </>
                  )}
                </span>
                <span className="text-slate-400 font-bold">{percent}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
