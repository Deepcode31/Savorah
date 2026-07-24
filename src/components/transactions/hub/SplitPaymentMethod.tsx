import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserPlus, Trash2, Check, Equal, SlidersHorizontal } from 'lucide-react';
import { Transaction, Friend, SplitParticipant } from '../../../types';
import { CATEGORY_COLORS } from '../../../data/initialData';
import { formatMoney } from '../../../utils/currency';
import { useAuth } from '../../../context/AuthContext';

const FRIENDS_KEY = 'savorah_friends';
const FRIEND_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4', '#F97316', '#EF4444'];

function loadFriends(): Friend[] {
  try {
    const raw = localStorage.getItem(FRIENDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveFriends(friends: Friend[]) {
  localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends));
}

interface SplitPaymentMethodProps {
  onSave: (payload: Omit<Transaction, 'id'>) => void;
  onCancel: () => void;
}

export const SplitPaymentMethod: React.FC<SplitPaymentMethodProps> = ({ onSave, onCancel }) => {
  const { currentUser } = useAuth();
  const myName = currentUser?.name?.split(' ')[0] || 'You';

  const [friends, setFriends] = useState<Friend[]>(() => loadFriends());
  const [newFriend, setNewFriend] = useState('');
  const [title, setTitle] = useState('');
  const [total, setTotal] = useState('');
  const [category, setCategory] = useState('Groceries & Dining');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [includeMe, setIncludeMe] = useState(true);
  const [mode, setMode] = useState<'equal' | 'custom'>('equal');
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});

  useEffect(() => {
    saveFriends(friends);
  }, [friends]);

  const addFriend = () => {
    const name = newFriend.trim();
    if (!name) return;
    if (friends.some((f) => f.name.toLowerCase() === name.toLowerCase())) {
      setNewFriend('');
      return;
    }
    const friend: Friend = {
      id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      color: FRIEND_COLORS[friends.length % FRIEND_COLORS.length],
    };
    setFriends((prev) => [...prev, friend]);
    setSelectedIds((prev) => [...prev, friend.id]);
    setNewFriend('');
  };

  const removeFriend = (id: string) => {
    setFriends((prev) => prev.filter((f) => f.id !== id));
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  const toggleFriend = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectedFriends = friends.filter((f) => selectedIds.includes(f.id));
  const peopleCount = selectedFriends.length + (includeMe ? 1 : 0);
  const totalNum = Number(total) || 0;

  const shares = useMemo(() => {
    if (peopleCount === 0 || totalNum <= 0) return [] as SplitParticipant[];

    if (mode === 'equal') {
      const base = Math.floor((totalNum * 100) / peopleCount) / 100;
      const remainder = Math.round((totalNum - base * peopleCount) * 100) / 100;
      const list: SplitParticipant[] = [];
      if (includeMe) {
        list.push({ id: 'me', name: myName, amount: base + remainder, isMe: true, settled: true });
      }
      selectedFriends.forEach((f, i) => {
        list.push({
          id: f.id,
          name: f.name,
          amount: includeMe ? base : i === 0 ? base + remainder : base,
          isMe: false,
          settled: false,
        });
      });
      return list;
    }

    // Custom
    const list: SplitParticipant[] = [];
    if (includeMe) {
      list.push({
        id: 'me',
        name: myName,
        amount: Number(customAmounts.me) || 0,
        isMe: true,
        settled: true,
      });
    }
    selectedFriends.forEach((f) => {
      list.push({
        id: f.id,
        name: f.name,
        amount: Number(customAmounts[f.id]) || 0,
        isMe: false,
        settled: false,
      });
    });
    return list;
  }, [mode, peopleCount, totalNum, includeMe, selectedFriends, customAmounts, myName]);

  const customSum = shares.reduce((s, p) => s + p.amount, 0);
  const customOk = mode === 'equal' || Math.abs(customSum - totalNum) < 0.02;
  const myShare = shares.find((p) => p.isMe)?.amount ?? 0;
  const dues = shares.filter((p) => !p.isMe);

  const canSave =
    title.trim() &&
    totalNum > 0 &&
    peopleCount >= 2 &&
    customOk &&
    (includeMe ? myShare > 0 : true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;

    const expenseAmount = includeMe ? myShare : totalNum;
    const dueLines = dues
      .map((d) => `${d.name} owes ${formatMoney(d.amount)}`)
      .join(' · ');

    onSave({
      title: title.trim(),
      amount: expenseAmount,
      type: 'expense',
      category,
      date,
      paymentMethod: 'Split / UPI',
      isEssential: false,
      tags: ['split', ...selectedFriends.map((f) => f.name)],
      notes: dueLines
        ? `Split of ${formatMoney(totalNum)} · ${dueLines}`
        : `Split of ${formatMoney(totalNum)}`,
      split: {
        totalAmount: totalNum,
        paidByMe: true,
        participants: shares,
      },
    });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSave}
      className="space-y-4"
    >
      {/* Friends roster */}
      <div className="rounded-2xl border border-white/10 bg-white/4 p-3.5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-mist-100">
          <Users className="w-3.5 h-3.5 text-cyan-300" />
          Your friends
        </div>
        <div className="flex gap-2">
          <input
            value={newFriend}
            onChange={(e) => setNewFriend(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addFriend();
              }
            }}
            placeholder="Add friend name…"
            className="flex-1 px-3 py-2 rounded-xl bg-white/6 border border-white/10 text-sm placeholder:text-mist-500 focus:outline-none focus:border-cyan-400/50"
          />
          <button
            type="button"
            onClick={addFriend}
            className="px-3 py-2 rounded-xl bg-cyan-400/15 border border-cyan-400/25 text-cyan-300 hover:bg-cyan-400/25 transition-colors"
            aria-label="Add friend"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>
        {friends.length === 0 ? (
          <p className="text-[11px] text-mist-500">Add friends once — they stay saved on this device.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {friends.map((f) => {
              const on = selectedIds.includes(f.id);
              return (
                <div key={f.id} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleFriend(f.id)}
                    className={`inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
                      on
                        ? 'border-transparent text-ink-950'
                        : 'border-white/10 text-mist-400 bg-white/4 hover:bg-white/8'
                    }`}
                    style={on ? { backgroundColor: f.color, color: '#06251a' } : undefined}
                  >
                    {on && <Check className="w-3 h-3" />}
                    {f.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFriend(f.id)}
                    className="w-6 h-6 rounded-full text-mist-500 hover:text-rose-300 hover:bg-rose-400/10 flex items-center justify-center"
                    aria-label={`Remove ${f.name}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <label className="flex items-center gap-2 text-[11px] text-mist-300 cursor-pointer">
          <input
            type="checkbox"
            checked={includeMe}
            onChange={(e) => setIncludeMe(e.target.checked)}
            className="rounded border-white/20"
          />
          Include me ({myName}) in the split
        </label>
      </div>

      {/* Bill details */}
      <div className="space-y-3">
        <div>
          <label className="text-[11px] font-semibold text-mist-500 uppercase tracking-wider">What for?</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Dinner, Uber, movie tickets…"
            required
            className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-white/6 border border-white/10 text-sm focus:outline-none focus:border-emerald-400/50"
          />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="text-[11px] font-semibold text-mist-500 uppercase tracking-wider">Total bill</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="0"
              required
              className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-white/6 border border-white/10 text-sm font-semibold focus:outline-none focus:border-emerald-400/50"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-mist-500 uppercase tracking-wider">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-white/6 border border-white/10 text-sm focus:outline-none focus:border-emerald-400/50"
            />
          </div>
        </div>
        <div>
          <label className="text-[11px] font-semibold text-mist-500 uppercase tracking-wider">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-white/6 border border-white/10 text-sm focus:outline-none focus:border-emerald-400/50 [&>option]:bg-ink-800"
          >
            {CATEGORY_COLORS.filter((c) => c.name !== 'Salary & Allowance').map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Split mode */}
      <div className="flex rounded-xl bg-white/5 border border-white/8 p-1">
        {(
          [
            { id: 'equal' as const, label: 'Equal split', icon: Equal },
            { id: 'custom' as const, label: 'Custom', icon: SlidersHorizontal },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold transition-all ${
              mode === m.id ? 'bg-white/12 text-mist-100' : 'text-mist-500 hover:text-mist-300'
            }`}
          >
            <m.icon className="w-3.5 h-3.5" />
            {m.label}
          </button>
        ))}
      </div>

      {/* Shares / dues */}
      <AnimatePresence mode="wait">
        {shares.length > 0 && (
          <motion.div
            key="dues"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-cyan-400/20 bg-cyan-400/8 p-3.5 space-y-2.5"
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
              {includeMe ? 'You paid · payment due' : 'Each person pays'}
            </p>
            {shares.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                      p.isMe ? 'bg-emerald-400/25 text-emerald-200' : 'bg-white/10 text-mist-200'
                    }`}
                  >
                    {p.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">
                      {p.name}
                      {p.isMe && <span className="text-mist-500 font-medium"> (you)</span>}
                    </p>
                    <p className="text-[10px] text-mist-500">
                      {p.isMe
                        ? 'Your share (saved as expense)'
                        : includeMe
                          ? 'Owes you'
                          : 'Their share'}
                    </p>
                  </div>
                </div>
                {mode === 'custom' ? (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={customAmounts[p.id] ?? ''}
                    onChange={(e) =>
                      setCustomAmounts((prev) => ({ ...prev, [p.id]: e.target.value }))
                    }
                    className="w-24 px-2 py-1.5 rounded-lg bg-white/8 border border-white/12 text-xs font-bold text-right focus:outline-none focus:border-cyan-400/50"
                  />
                ) : (
                  <p className={`text-sm font-bold shrink-0 ${p.isMe ? 'text-emerald-300' : 'text-cyan-200'}`}>
                    {formatMoney(p.amount)}
                  </p>
                )}
              </div>
            ))}
            {mode === 'custom' && !customOk && totalNum > 0 && (
              <p className="text-[11px] text-amber-300">
                Shares total {formatMoney(customSum)} — must equal {formatMoney(totalNum)}.
              </p>
            )}
            {includeMe && dues.length > 0 && (
              <div className="pt-2 border-t border-cyan-400/15 flex justify-between text-xs">
                <span className="text-mist-400">Friends owe you</span>
                <span className="font-bold text-cyan-200">
                  {formatMoney(dues.reduce((s, d) => s + d.amount, 0))}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {peopleCount < 2 && (
        <p className="text-[11px] text-amber-300/90">Select at least one friend and include yourself (or 2+ friends).</p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl bg-white/8 hover:bg-white/12 text-mist-300 font-bold text-xs transition-all"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!canSave}
          className="flex-[2] py-2.5 rounded-xl btn-accent font-bold text-xs disabled:opacity-40 disabled:pointer-events-none"
        >
          Save split
        </button>
      </div>
    </motion.form>
  );
};
