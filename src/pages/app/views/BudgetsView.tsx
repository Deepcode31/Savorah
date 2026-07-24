import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, AlertCircle, CheckCircle2, Pencil, Check, X } from 'lucide-react';
import { useFinance } from '../../../context/FinanceContext';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../services/api';
import { CATEGORY_COLORS } from '../../../data/initialData';
import { formatMoney } from '../../../utils/currency';
import { Counter } from '../../../components/motion/primitives';

const BudgetsView: React.FC = () => {
  const { budgets, updateBudgetLimit, setBudgetsBulk } = useFinance();
  const { currentUser } = useAuth();

  const [editing, setEditing] = useState<string | null>(null);
  const [tempLimit, setTempLimit] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiResult, setAiResult] = useState<{ error?: string; topAdvice?: string[] } | null>(null);

  const persona = currentUser?.persona || 'professional';

  const totalLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const remaining = totalLimit - totalSpent;

  const saveEdit = (category: string) => {
    const val = Number(tempLimit);
    if (!Number.isNaN(val) && val >= 0) updateBudgetLimit(category, val);
    setEditing(null);
  };

  const generateAiBudget = async () => {
    setAiBusy(true);
    setAiResult(null);
    try {
      const data = await api<any>('/api/ai/budget-recommendation', {
        method: 'POST',
        body: JSON.stringify({ persona, monthlyIncome: currentUser?.monthlyIncome || 45000 }),
      });
      if (Array.isArray(data.recommendedBudgets)) {
        await setBudgetsBulk(
          data.recommendedBudgets.map((rb: any) => ({
            category: rb.category === 'Emergency Buffer' ? 'Other' : rb.category,
            limit: Math.max(10, Math.round(rb.recommendedLimit)),
          }))
        );
      }
      setAiResult({ topAdvice: data.topAdvice });
    } catch (e: any) {
      setAiResult({ error: e?.message || 'AI budget generation failed.' });
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">Budgets</h1>
          <p className="text-sm text-mist-500 mt-1">
            Set spending limits per category, or let AI build a plan around your income.
          </p>
        </div>
        <button
          onClick={generateAiBudget}
          disabled={aiBusy}
          className="btn-accent px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 shrink-0 w-fit disabled:opacity-60"
        >
          {aiBusy ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-ink-950 border-t-transparent animate-spin" />
              Building your plan…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> AI starter budget
            </>
          )}
        </button>
      </div>

      {/* AI result */}
      {aiResult && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass rounded-2xl p-5 ${aiResult.error ? 'border-rose-400/25' : 'border-emerald-400/25'}`}
          role="status"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={`w-4.5 h-4.5 ${aiResult.error ? 'text-rose-300' : 'text-emerald-300'}`} />
            <p className="text-sm font-bold">
              {aiResult.error ? 'AI budget failed' : `AI budget applied for your ${persona} profile`}
            </p>
          </div>
          {aiResult.error && <p className="text-sm text-rose-300">{aiResult.error}</p>}
          {aiResult.topAdvice && (
            <ul className="space-y-1.5 mt-1">
              {aiResult.topAdvice.map((tip, i) => (
                <li key={i} className="text-xs text-mist-300 flex gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total limit', value: totalLimit, tone: '' },
          { label: 'Total spent', value: totalSpent, tone: '' },
          { label: 'Remaining', value: remaining, tone: remaining < 0 ? 'text-rose-300' : 'text-emerald-300' },
        ].map((s) => (
          <div key={s.label} className="glass card-ring rounded-3xl p-5">
            <p className="text-[11px] font-semibold text-mist-500 uppercase tracking-widest mb-2">{s.label}</p>
            <p className={`font-display text-xl md:text-2xl font-bold ${s.tone}`}>
              <Counter value={s.value} prefix="₹" />
            </p>
          </div>
        ))}
      </div>

      {/* Budget cards */}
      {budgets.length === 0 ? (
        <div className="glass card-ring rounded-3xl py-16 text-center">
          <p className="text-sm text-mist-500">No budgets yet. Generate an AI starter plan to begin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b, i) => {
            const pct = Math.min(100, Math.round((b.spent / Math.max(1, b.limit)) * 100));
            const over = b.spent > b.limit;
            const warn = pct >= 80 && !over;
            const color = b.color || CATEGORY_COLORS.find((c) => c.name === b.category)?.color || '#34d399';

            return (
              <motion.div
                key={b.category}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="glass card-ring rounded-3xl p-6 hover:border-white/15 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <h3 className="text-sm font-bold truncate">{b.category}</h3>
                  </div>

                  {editing === b.category ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={tempLimit}
                        onChange={(e) => setTempLimit(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(b.category)}
                        className="w-24 px-2.5 py-1.5 rounded-xl bg-white/8 border border-white/15 text-xs font-bold focus:outline-none focus:border-emerald-400/60"
                        autoFocus
                        aria-label={`New limit for ${b.category}`}
                      />
                      <button
                        onClick={() => saveEdit(b.category)}
                        className="w-7 h-7 rounded-lg btn-accent flex items-center justify-center"
                        aria-label="Save limit"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="w-7 h-7 rounded-lg glass flex items-center justify-center text-mist-400"
                        aria-label="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditing(b.category);
                        setTempLimit(String(b.limit));
                      }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-mist-500 hover:text-white transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                  )}
                </div>

                <div className="flex items-baseline justify-between text-sm mb-2.5">
                  <span className="text-mist-500">
                    Spent <strong className="text-mist-100">{formatMoney(b.spent)}</strong>
                  </span>
                  <span className="text-mist-500">
                    Limit <strong className="text-mist-100">{formatMoney(b.limit)}</strong>
                  </span>
                </div>

                <div className="h-2.5 rounded-full bg-white/6 overflow-hidden mb-3">
                  <motion.div
                    className={`h-full rounded-full ${over ? 'bg-rose-400' : warn ? 'bg-amber-400' : 'bg-emerald-400'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.9, delay: 0.2 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  {over ? (
                    <span className="flex items-center gap-1.5 font-bold text-rose-300">
                      <AlertCircle className="w-3.5 h-3.5" /> Over by {formatMoney(b.spent - b.limit)}
                    </span>
                  ) : warn ? (
                    <span className="flex items-center gap-1.5 font-bold text-amber-300">
                      <AlertCircle className="w-3.5 h-3.5" /> Nearing limit
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 font-bold text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {formatMoney(b.limit - b.spent)} remaining
                    </span>
                  )}
                  <span className="font-bold text-mist-500">{pct}%</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BudgetsView;
