import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Trash2, Pencil, ArrowUpRight, ArrowDownLeft, Inbox, Users, Check } from 'lucide-react';
import { useFinance } from '../../../context/FinanceContext';
import { Transaction } from '../../../types';
import { CATEGORY_COLORS } from '../../../data/initialData';
import { AddTransactionHub } from '../../../components/transactions/AddTransactionHub';
import { formatMoney } from '../../../utils/currency';

const TransactionsView: React.FC = () => {
  const { transactions, deleteTransaction, editTransaction } = useFinance();

  const [hubOpen, setHubOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [type, setType] = useState<'all' | 'income' | 'expense'>('all');

  const filtered = useMemo(
    () =>
      transactions.filter((tx) => {
        const q = query.toLowerCase();
        const matchesQuery =
          !q ||
          tx.title.toLowerCase().includes(q) ||
          tx.category.toLowerCase().includes(q) ||
          (tx.notes || '').toLowerCase().includes(q);
        const matchesCategory = category === 'all' || tx.category === category;
        const matchesType = type === 'all' || tx.type === type;
        return matchesQuery && matchesCategory && matchesType;
      }),
    [transactions, query, category, type]
  );

  const openDues = useMemo(() => {
    const rows: { txId: string; title: string; friendId: string; name: string; amount: number }[] = [];
    for (const tx of transactions) {
      if (!tx.split?.paidByMe) continue;
      for (const p of tx.split.participants) {
        if (!p.isMe && !p.settled && p.amount > 0) {
          rows.push({
            txId: tx.id,
            title: tx.title,
            friendId: p.id,
            name: p.name,
            amount: p.amount,
          });
        }
      }
    }
    return rows;
  }, [transactions]);

  const duesByFriend = useMemo(() => {
    const map = new Map<string, { name: string; amount: number }>();
    for (const d of openDues) {
      const cur = map.get(d.name) || { name: d.name, amount: 0 };
      cur.amount += d.amount;
      map.set(d.name, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  }, [openDues]);

  const totalDue = duesByFriend.reduce((s, d) => s + d.amount, 0);

  const markSettled = async (txId: string, friendId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx?.split) return;
    const participants = tx.split.participants.map((p) =>
      p.id === friendId ? { ...p, settled: true } : p
    );
    await editTransaction(txId, { split: { ...tx.split, participants } });
  };

  const catColor = (name: string) =>
    CATEGORY_COLORS.find((c) => c.name === name)?.color || '#64748B';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-sm text-mist-500 mt-1">
            {transactions.length} recorded · manual, split with friends, SMS, receipt or statement.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTx(null);
            setHubOpen(true);
          }}
          className="btn-accent px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 shrink-0 w-fit"
        >
          <Plus className="w-4 h-4" /> Add transaction
        </button>
      </div>

      {/* Payment due from friends */}
      {duesByFriend.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass card-ring rounded-3xl p-5 border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 to-transparent"
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-cyan-400/15 flex items-center justify-center text-cyan-300">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-base font-semibold">Payment due to you</h2>
                <p className="text-xs text-mist-500 mt-0.5">
                  Friends still owe {formatMoney(totalDue)} from split bills
                </p>
              </div>
            </div>
            <span className="font-display text-lg font-bold text-cyan-300 shrink-0">{formatMoney(totalDue)}</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {duesByFriend.map((d) => (
              <div
                key={d.name}
                className="flex items-center justify-between gap-2 rounded-2xl bg-white/5 border border-white/8 px-3.5 py-2.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-8 h-8 rounded-full bg-cyan-400/20 text-cyan-200 flex items-center justify-center text-xs font-bold shrink-0">
                    {d.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{d.name}</p>
                    <p className="text-[11px] text-mist-500">owes you</p>
                  </div>
                </div>
                <p className="font-bold text-sm text-cyan-200 shrink-0">{formatMoney(d.amount)}</p>
              </div>
            ))}
          </div>
          {openDues.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/8 space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-mist-500 mb-2">Open splits</p>
              {openDues.slice(0, 6).map((d) => (
                <div key={`${d.txId}-${d.friendId}`} className="flex items-center justify-between gap-2 text-xs">
                  <p className="text-mist-300 truncate">
                    <span className="font-semibold text-mist-100">{d.name}</span>
                    <span className="text-mist-500"> · {d.title}</span>
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-semibold">{formatMoney(d.amount)}</span>
                    <button
                      type="button"
                      onClick={() => markSettled(d.txId, d.friendId)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-400/12 text-emerald-300 hover:bg-emerald-400/20 font-semibold transition-colors"
                      title="Mark as paid"
                    >
                      <Check className="w-3 h-3" /> Settled
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Filters */}
      <div className="glass card-ring rounded-3xl p-4 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-mist-500" />
          <input
            type="search"
            placeholder="Search title, category, notes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white/5 border border-white/8 text-sm placeholder:text-mist-500 focus:outline-none focus:border-emerald-400/50"
            aria-label="Search transactions"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex rounded-2xl bg-white/5 border border-white/8 p-1" role="tablist" aria-label="Transaction type">
            {(['all', 'income', 'expense'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`relative px-4 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                  type === t ? 'text-ink-950' : 'text-mist-500 hover:text-white'
                }`}
                role="tab"
                aria-selected={type === t}
              >
                {type === t && (
                  <motion.span
                    layoutId="tx-type-pill"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'var(--accent)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{t}</span>
              </button>
            ))}
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/8 text-xs font-semibold text-mist-300 focus:outline-none focus:border-emerald-400/50 [&>option]:bg-ink-800"
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {CATEGORY_COLORS.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="glass card-ring rounded-3xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Inbox className="w-8 h-8 mx-auto text-mist-500 mb-3" />
            <p className="text-sm text-mist-500">No transactions match your filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            <AnimatePresence initial={false}>
              {filtered.map((tx) => (
                <motion.div
                  key={tx.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="group flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors"
                >
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      tx.type === 'income'
                        ? 'bg-emerald-400/12 text-emerald-300'
                        : tx.split
                          ? 'bg-cyan-400/12 text-cyan-300'
                          : 'bg-white/6 text-mist-300'
                    }`}
                  >
                    {tx.type === 'income' ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : tx.split ? (
                      <Users className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{tx.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 text-[11px] font-medium text-mist-300">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor(tx.category) }} />
                        {tx.category}
                      </span>
                      {tx.split && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-400/12 text-[11px] font-semibold text-cyan-300">
                          Split · {formatMoney(tx.split.totalAmount)}
                        </span>
                      )}
                      <span className="text-[11px] text-mist-500 hidden sm:inline">
                        {tx.date} · {tx.paymentMethod}
                      </span>
                    </div>
                    {tx.notes && <p className="text-[11px] text-mist-500 truncate mt-0.5">{tx.notes}</p>}
                  </div>

                  <p className={`font-display font-bold text-sm md:text-base shrink-0 ${tx.type === 'income' ? 'text-emerald-300' : ''}`}>
                    {tx.type === 'income' ? '+' : '−'}
                    {formatMoney(tx.amount)}
                  </p>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => {
                        setEditingTx(tx);
                        setHubOpen(true);
                      }}
                      className="w-8 h-8 rounded-xl glass hover:bg-white/10 flex items-center justify-center text-mist-400 hover:text-white transition-colors"
                      aria-label={`Edit ${tx.title}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      className="w-8 h-8 rounded-xl glass hover:bg-rose-500/15 flex items-center justify-center text-mist-400 hover:text-rose-300 transition-colors"
                      aria-label={`Delete ${tx.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {hubOpen && (
        <AddTransactionHub
          isOpen={hubOpen}
          editingTx={editingTx}
          onClose={() => {
            setHubOpen(false);
            setEditingTx(null);
          }}
        />
      )}
    </div>
  );
};

export default TransactionsView;
