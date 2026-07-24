import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, CheckCircle2, Calendar, X, IndianRupee, Target } from 'lucide-react';
import { useFinance } from '../../../context/FinanceContext';
import { CATEGORY_COLORS } from '../../../data/initialData';
import { formatMoney } from '../../../utils/currency';

const fieldCls =
  'w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm placeholder:text-mist-500 focus:outline-none focus:border-emerald-400/60 [&>option]:bg-ink-800';

const GoalsView: React.FC = () => {
  const { goals, addGoal, contributeToGoal, deleteGoal } = useFinance();

  const [addOpen, setAddOpen] = useState(false);
  const [contributeId, setContributeId] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState('1000');

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('50000');
  const [deadline, setDeadline] = useState('2026-12-31');
  const [category, setCategory] = useState('Investments & Savings');
  const [notes, setNotes] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await addGoal({ title: title.trim(), targetAmount: Number(targetAmount) || 1000, deadline, category, notes });
    setAddOpen(false);
    setTitle('');
    setTargetAmount('50000');
    setNotes('');
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeId) return;
    await contributeToGoal(contributeId, Number(contributeAmount) || 0);
    setContributeId(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">Goals</h1>
          <p className="text-sm text-mist-500 mt-1">
            Emergency funds, trips, gadgets — watch every deposit bring them closer.
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="btn-accent px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 shrink-0 w-fit"
        >
          <Plus className="w-4 h-4" /> New goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="glass card-ring rounded-3xl py-20 text-center">
          <Target className="w-8 h-8 mx-auto text-mist-500 mb-3" />
          <p className="text-sm text-mist-500">No goals yet. Create your first one — future you says thanks.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AnimatePresence initial={false}>
            {goals.map((g, i) => {
              const pct = Math.min(100, Math.round((g.currentAmount / Math.max(1, g.targetAmount)) * 100));
              const done = g.currentAmount >= g.targetAmount;
              return (
                <motion.div
                  key={g.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative glass card-ring rounded-3xl p-6 overflow-hidden hover:border-white/15 transition-colors"
                >
                  {done && (
                    <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-emerald-500/15 blur-2xl" aria-hidden />
                  )}
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="min-w-0">
                      <span
                        className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2"
                        style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                      >
                        {g.category}
                      </span>
                      <h3 className="font-display text-lg font-semibold truncate">{g.title}</h3>
                      {g.notes && <p className="text-xs text-mist-500 mt-1 line-clamp-2">{g.notes}</p>}
                    </div>
                    <button
                      onClick={() => deleteGoal(g.id)}
                      className="w-8 h-8 rounded-xl glass flex items-center justify-center text-mist-500 hover:text-rose-300 hover:bg-rose-500/10 transition-colors shrink-0"
                      aria-label={`Delete goal ${g.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-baseline justify-between text-sm mb-2.5">
                    <span className="font-display text-xl font-bold" style={{ color: 'var(--accent)' }}>
                      {formatMoney(g.currentAmount)}
                    </span>
                    <span className="text-mist-500 text-xs">of {formatMoney(g.targetAmount)}</span>
                  </div>

                  <div className="h-2.5 rounded-full bg-white/6 overflow-hidden mb-3">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: done
                          ? 'linear-gradient(90deg, var(--accent-strong), var(--accent))'
                          : 'var(--accent)',
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: 0.2 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-mist-500 mb-5">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> {g.deadline}
                    </span>
                    <span className="font-bold" style={{ color: 'var(--accent)' }}>
                      {pct}%
                    </span>
                  </div>

                  {done ? (
                    <div className="py-3 rounded-2xl bg-emerald-400/12 text-emerald-300 text-sm font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4.5 h-4.5" /> Goal achieved
                    </div>
                  ) : (
                    <button
                      onClick={() => setContributeId(g.id)}
                      className="w-full py-3 rounded-2xl glass hover:bg-white/8 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <IndianRupee className="w-4 h-4" style={{ color: 'var(--accent)' }} /> Add deposit
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Contribute modal */}
      <AnimatePresence>
        {contributeId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setContributeId(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              className="w-full max-w-sm glass-strong card-ring rounded-3xl p-7 bg-ink-900 relative"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label="Add deposit"
            >
              <button
                onClick={() => setContributeId(null)}
                className="absolute top-5 right-5 w-9 h-9 rounded-xl glass flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="font-display text-lg font-semibold mb-5">Add deposit</h3>
              <form onSubmit={handleContribute} className="space-y-4">
                <div className="relative">
                  <IndianRupee className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-mist-500" />
                  <input
                    type="number"
                    value={contributeAmount}
                    onChange={(e) => setContributeAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold focus:outline-none focus:border-emerald-400/60"
                    min={1}
                    required
                    autoFocus
                    aria-label="Deposit amount in rupees"
                  />
                </div>
                <button type="submit" className="btn-accent w-full py-3.5 rounded-2xl text-sm font-bold">
                  Confirm deposit
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create goal modal */}
      <AnimatePresence>
        {addOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setAddOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              className="w-full max-w-md glass-strong card-ring rounded-3xl p-7 bg-ink-900 relative max-h-[90vh] overflow-y-auto custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label="Create goal"
            >
              <button
                onClick={() => setAddOpen(false)}
                className="absolute top-5 right-5 w-9 h-9 rounded-xl glass flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="font-display text-lg font-semibold mb-5">Create a goal</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <input
                  type="text"
                  placeholder="Goal title — e.g. Goa trip, Emergency fund"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={fieldCls}
                  required
                  autoFocus
                  aria-label="Goal title"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Target (₹)"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className={fieldCls}
                    min={1}
                    required
                    aria-label="Target amount in rupees"
                  />
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className={fieldCls}
                    aria-label="Target date"
                  />
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={fieldCls}
                  aria-label="Goal category"
                >
                  {CATEGORY_COLORS.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={fieldCls}
                  aria-label="Notes"
                />
                <button type="submit" className="btn-accent w-full py-3.5 rounded-2xl text-sm font-bold">
                  Launch goal
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GoalsView;
