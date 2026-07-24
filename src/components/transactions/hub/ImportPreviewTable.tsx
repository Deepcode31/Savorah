import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, AlertTriangle, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { StatementRow } from '../../../services/transactionImportServices';

interface ImportPreviewTableProps {
  rows: StatementRow[];
  onImport: (selected: StatementRow[]) => void;
  onCancel: () => void;
}

export const ImportPreviewTable: React.FC<ImportPreviewTableProps> = ({ rows, onImport, onCancel }) => {
  const [items, setItems] = useState<StatementRow[]>(rows);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const toggle = (id: string) =>
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r)));

  const selectAll = () => setItems((prev) => prev.map((r) => ({ ...r, selected: !r.isDuplicate })));
  const deselectAll = () => setItems((prev) => prev.map((r) => ({ ...r, selected: false })));

  const filtered = items
    .filter((r) => {
      const q = search.toLowerCase();
      return (
        (r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)) &&
        (typeFilter === 'all' || r.type === typeFilter)
      );
    })
    .sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortDir === 'asc' ? diff : -diff;
    });

  const selectedCount = items.filter((r) => r.selected).length;

  const handleImport = () => onImport(items.filter((r) => r.selected));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Stats bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="px-3 py-1.5 rounded-xl bg-white/8 text-[11px] font-bold text-mist-300">
          {items.length} transactions found
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-emerald-400/15 text-[11px] font-bold text-emerald-300">
          {selectedCount} selected
        </div>
        {items.filter((r) => r.isDuplicate).length > 0 && (
          <div className="px-3 py-1.5 rounded-xl bg-amber-400/15 text-[11px] font-bold text-amber-300 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {items.filter((r) => r.isDuplicate).length} duplicates skipped
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-mist-500" />
          <input
            type="text"
            placeholder="Search transactions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-mist-100 focus:outline-none focus:border-emerald-400/60 transition-all"
          />
        </div>
        <div className="flex gap-1.5">
          <div className="flex rounded-xl bg-white/8 p-0.5 border border-white/10">
            {(['all', 'income', 'expense'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition-all ${
                  typeFilter === f ? 'bg-white/8 text-emerald-300 shadow-sm' : 'text-mist-500'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
            className="px-2.5 py-1.5 rounded-xl bg-white/8 border border-white/10 text-[10px] font-bold text-mist-300 hover:bg-white/12 transition-all flex items-center gap-1"
          >
            Date {sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/10 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 px-3 py-2 bg-white/5 border-b border-white/10 text-[10px] font-bold uppercase tracking-wider text-mist-500">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedCount > 0 && selectedCount === items.filter((r) => !r.isDuplicate).length}
              onChange={(e) => e.target.checked ? selectAll() : deselectAll()}
              className="rounded text-emerald-300"
            />
          </div>
          <div>Transaction</div>
          <div className="text-right">Amount</div>
          <div className="hidden sm:block">Date</div>
          <div className="text-center">Action</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/6 max-h-56 overflow-y-auto custom-scrollbar">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-xs text-mist-500">No transactions match your filter.</div>
            ) : (
              filtered.map((row) => (
                <motion.div
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 px-3 py-2.5 items-center transition-colors ${
                    row.isDuplicate ? 'opacity-50 bg-amber-400/10/60' : row.selected ? 'bg-emerald-400/10/50' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={row.selected}
                    onChange={() => toggle(row.id)}
                    disabled={row.isDuplicate}
                    className="rounded text-emerald-300"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-mist-100 truncate">{row.title}</span>
                      {row.isDuplicate && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-amber-400/15 text-amber-300 text-[9px] font-bold">
                          Duplicate
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-mist-500">{row.category}</span>
                  </div>
                  <div className={`text-[11px] font-black text-right ${row.type === 'income' ? 'text-emerald-300' : 'text-mist-100'}`}>
                    {row.type === 'income' ? '+' : '-'}₹{row.amount.toLocaleString("en-IN")}
                  </div>
                  <div className="hidden sm:block text-[10px] text-mist-500">{row.date}</div>
                  <button
                    onClick={() => toggle(row.id)}
                    disabled={row.isDuplicate}
                    className={`p-1 rounded-lg transition-all ${
                      row.selected
                        ? 'text-emerald-300 hover:text-emerald-300'
                        : 'text-mist-500 hover:text-mist-500'
                    } disabled:opacity-40`}
                    title={row.selected ? 'Deselect' : 'Select'}
                  >
                    {row.selected ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bulk actions */}
      <div className="flex gap-2 flex-wrap text-[11px]">
        <button onClick={selectAll} className="text-emerald-300 hover:underline font-semibold">Select all</button>
        <span className="text-mist-500">·</span>
        <button onClick={deselectAll} className="text-mist-500 hover:underline font-semibold">Deselect all</button>
      </div>

      {/* Import button */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 px-4 rounded-xl bg-white/8 hover:bg-white/12 text-mist-300 font-bold text-xs transition-all"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleImport}
          disabled={selectedCount === 0}
          className="flex-[2] py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all disabled:opacity-40"
        >
          Import {selectedCount > 0 ? `${selectedCount} Transaction${selectedCount > 1 ? 's' : ''}` : '—'}
        </button>
      </div>
    </motion.div>
  );
};
