import React, { useState } from 'react';
import { ExtractedStatementRow } from '../../../services/statementParser';
import { CATEGORY_COLORS } from '../../../data/initialData';
import {
  Check,
  X,
  Search,
  CheckSquare,
  Square,
  AlertTriangle,
  Download,
  Filter,
} from 'lucide-react';

interface ImportPreviewTableProps {
  rows: ExtractedStatementRow[];
  onImportSelected: (selectedRows: ExtractedStatementRow[]) => void;
  onCancel: () => void;
}

export const ImportPreviewTable: React.FC<ImportPreviewTableProps> = ({
  rows: initialRows,
  onImportSelected,
  onCancel,
}) => {
  const [rows, setRows] = useState<ExtractedStatementRow[]>(initialRows);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  // Toggle selection for a single row
  const toggleRowSelect = (id: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r))
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    const allSelected = filteredRows.every((r) => r.selected);
    setRows((prev) =>
      prev.map((r) => {
        if (filteredRows.some((fr) => fr.id === r.id)) {
          return { ...r, selected: !allSelected };
        }
        return r;
      })
    );
  };

  // Update category per row
  const handleCategoryChange = (id: string, newCategory: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, category: newCategory } : r))
    );
  };

  // Filtered rows
  const filteredRows = rows.filter((r) => {
    const matchesSearch =
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || r.type === filterType;
    return matchesSearch && matchesType;
  });

  const selectedCount = rows.filter((r) => r.selected).length;
  const duplicateCount = rows.filter((r) => r.isDuplicate).length;

  const handleImportClick = () => {
    const selected = rows.filter((r) => r.selected);
    if (selected.length > 0) {
      onImportSelected(selected);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/95 p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all"
          >
            {filteredRows.every((r) => r.selected) ? (
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Square className="w-3.5 h-3.5 text-slate-400" />
            )}
            Select All ({filteredRows.length})
          </button>

          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-xl">
            {selectedCount} Selected
          </span>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search statement..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="py-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Incomes Only</option>
          </select>
        </div>
      </div>

      {/* Duplicate Alert Notice */}
      {duplicateCount > 0 && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>{duplicateCount} potential duplicate transactions detected.</strong> They are deselected by default.
            </span>
          </div>
        </div>
      )}

      {/* Statement Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white/95 shadow-sm max-h-72 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 sticky top-0 z-10">
              <th className="py-2.5 px-3 text-center">Import</th>
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Description</th>
              <th className="py-2.5 px-3 text-right">Amount (₹)</th>
              <th className="py-2.5 px-3">Predicted Category</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
            {filteredRows.map((row) => (
              <tr
                key={row.id}
                className={`transition-colors hover:bg-slate-50/80 ${
                  row.selected ? 'bg-emerald-50/20' : 'opacity-70'
                }`}
              >
                <td className="py-2.5 px-3 text-center">
                  <input
                    type="checkbox"
                    checked={row.selected}
                    onChange={() => toggleRowSelect(row.id)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </td>
                <td className="py-2.5 px-3 font-semibold text-slate-600 whitespace-nowrap">
                  {row.date}
                </td>
                <td className="py-2.5 px-3 font-bold text-slate-900 max-w-[200px] truncate" title={row.description}>
                  {row.description}
                </td>
                <td
                  className={`py-2.5 px-3 text-right font-black whitespace-nowrap ${
                    row.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                  }`}
                >
                  {row.type === 'income' ? '+' : '-'}₹{row.amount.toLocaleString()}
                </td>
                <td className="py-2.5 px-3">
                  <select
                    value={row.category}
                    onChange={(e) => handleCategoryChange(row.id, e.target.value)}
                    className="py-1 px-2 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                  >
                    {CATEGORY_COLORS.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2.5 px-3 text-center">
                  {row.isDuplicate ? (
                    <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold" title={row.duplicateReason}>
                      Duplicate
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                      Ready
                    </span>
                  )}
                </td>
              </tr>
            ))}

            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                  No statement transactions found matching filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-600 transition-all"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleImportClick}
          disabled={selectedCount === 0}
          className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Import {selectedCount} Transactions
        </button>
      </div>
    </div>
  );
};
