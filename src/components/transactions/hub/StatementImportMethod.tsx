import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { UploadDropzone } from './UploadDropzone';
import { parseStatement, StatementRow } from '../../../services/transactionImportServices';
import { ImportPreviewTable } from './ImportPreviewTable';
import { useFinance } from '../../../context/FinanceContext';

type Stage = 'upload' | 'processing' | 'preview';

interface StatementImportMethodProps {
  onImported: (count: number) => void;
  onCancel: () => void;
}

export const StatementImportMethod: React.FC<StatementImportMethodProps> = ({ onImported, onCancel }) => {
  const { transactions, addTransaction } = useFinance();
  const [stage, setStage] = useState<Stage>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<StatementRow[]>([]);
  const [error, setError] = useState('');

  const handleFile = (f: File) => {
    setFile(f);
    setError('');
  };

  const handleStartParse = async () => {
    if (!file) return;
    setStage('processing');
    setError('');
    try {
      const parsed = await parseStatement(file, transactions);
      if (!parsed.length) {
        throw new Error('No transactions found. Try a CSV export from your bank.');
      }
      setRows(parsed);
      setStage('preview');
    } catch (e: any) {
      setError(e?.message || 'Statement import failed');
      setStage('upload');
    }
  };

  const handleImport = async (selected: StatementRow[]) => {
    for (const row of selected) {
      const { id: _id, isDuplicate: _dup, selected: _sel, source: _src, confidence: _conf, ...payload } = row;
      await addTransaction(payload);
    }
    onImported(selected.length);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <AnimatePresence mode="wait">
        {stage === 'upload' && (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <UploadDropzone
              onFileSelect={handleFile}
              accept=".csv,.txt,.pdf,image/*"
              label="Drop your bank statement here"
              sublabel="Best: CSV export. Also PDF (text) or screenshot."
              acceptedTypes={['CSV', 'TXT', 'PDF', 'IMG']}
              file={file}
              onClear={() => {
                setFile(null);
                setError('');
              }}
            />
            {error && (
              <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-100 rounded-xl px-3 py-2">
                {error}
              </p>
            )}
            {!file && (
              <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-mist-500">
                <p className="font-bold text-mist-300 mb-1">How to import</p>
                <ul className="space-y-0.5 list-disc list-inside">
                  <li>Download a CSV from your bank / UPI app (recommended)</li>
                  <li>Text-based PDF statements also work</li>
                  <li>Excel (.xlsx) — export as CSV first</li>
                </ul>
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl bg-white/8 text-mist-300 font-semibold text-xs"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleStartParse}
                disabled={!file}
                className="flex-[2] py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Parse with AI
              </button>
            </div>
          </motion.div>
        )}

        {stage === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 py-10 rounded-2xl bg-white/5 border border-white/10"
          >
            <Loader2 className="w-8 h-8 text-emerald-300 animate-spin" />
            <p className="text-sm font-semibold text-mist-100">Parsing statement…</p>
            <p className="text-xs text-mist-500">Detecting and categorizing transactions</p>
          </motion.div>
        )}

        {stage === 'preview' && (
          <motion.div key="preview" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <ImportPreviewTable
              rows={rows}
              onImport={handleImport}
              onCancel={() => setStage('upload')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
