import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Edit3, ScanLine, FileSpreadsheet, MessageSquare, Users } from 'lucide-react';
import { Transaction } from '../../types';
import { useFinance } from '../../context/FinanceContext';
import { ExtractedTransaction, checkDuplicate } from '../../services/transactionImportServices';
import { ManualEntryMethod } from './hub/ManualEntryMethod';
import { ReceiptScanMethod } from './hub/ReceiptScanMethod';
import { StatementImportMethod } from './hub/StatementImportMethod';
import { SMSParseMethod } from './hub/SMSParseMethod';
import { SplitPaymentMethod } from './hub/SplitPaymentMethod';
import { TransactionReviewForm } from './hub/TransactionReviewForm';

type Method = 'manual' | 'receipt' | 'statement' | 'sms' | 'split';
type HubStage = 'select' | Method | 'review' | 'statement-success';

interface AddTransactionHubProps {
  isOpen: boolean;
  editingTx?: Transaction | null;
  onClose: () => void;
}

const METHODS: { id: Method; icon: React.FC<{ className?: string }>; label: string; desc: string; accent: string }[] = [
  {
    id: 'manual',
    icon: Edit3,
    label: 'Manual Entry',
    desc: 'Type transaction details manually',
    accent: 'bg-emerald-400/8 border-emerald-400/20 hover:bg-emerald-400/15 text-emerald-300',
  },
  {
    id: 'split',
    icon: Users,
    label: 'Split with Friends',
    desc: 'Add friends, split the bill, track who owes you',
    accent: 'bg-cyan-400/8 border-cyan-400/20 hover:bg-cyan-400/15 text-cyan-300',
  },
  {
    id: 'receipt',
    icon: ScanLine,
    label: 'Scan Bank Receipt',
    desc: 'Upload image or PDF — AI extracts details',
    accent: 'bg-violet-400/8 border-violet-400/20 hover:bg-violet-400/15 text-violet-300',
  },
  {
    id: 'statement',
    icon: FileSpreadsheet,
    label: 'Import Bank Statement',
    desc: 'CSV, Excel or PDF — bulk import transactions',
    accent: 'bg-amber-400/8 border-amber-400/20 hover:bg-amber-400/15 text-amber-300',
  },
  {
    id: 'sms',
    icon: MessageSquare,
    label: 'Paste Payment SMS',
    desc: 'Paste UPI/bank SMS — AI parses it instantly',
    accent: 'bg-blue-400/8 border-blue-400/20 hover:bg-blue-400/15 text-blue-300',
  },
];

const STAGE_TITLE: Record<HubStage, string> = {
  select: 'Add Transaction',
  manual: 'Manual Entry',
  split: 'Split with Friends',
  receipt: 'Scan Bank Receipt',
  statement: 'Import Bank Statement',
  sms: 'Paste Payment SMS',
  review: 'Review & Confirm',
  'statement-success': 'Import Complete',
};

export const AddTransactionHub: React.FC<AddTransactionHubProps> = ({ isOpen, editingTx, onClose }) => {
  const { transactions, addTransaction, editTransaction } = useFinance();

  // If editing, go straight to manual
  const [stage, setStage] = useState<HubStage>(editingTx ? 'manual' : 'select');
  const [extracted, setExtracted] = useState<ExtractedTransaction | null>(null);
  const [importedCount, setImportedCount] = useState(0);

  // Reset on open/close
  React.useEffect(() => {
    if (isOpen) {
      setStage(editingTx ? 'manual' : 'select');
      setExtracted(null);
    }
  }, [isOpen, editingTx]);

  const isDuplicate = extracted ? checkDuplicate(extracted, transactions) : false;

  const handleExtracted = (tx: ExtractedTransaction) => {
    setExtracted(tx);
    setStage('review');
  };

  const handleSaveExtracted = (tx: ExtractedTransaction) => {
    const { confidence: _c, source: _s, ...payload } = tx;
    addTransaction({ ...payload, tags: tx.tags ?? [] });
    onClose();
  };

  const handleManualSave = (payload: Omit<Transaction, 'id'>) => {
    if (editingTx) {
      editTransaction(editingTx.id, payload);
    } else {
      addTransaction(payload);
    }
    onClose();
  };

  const handleStatementImported = (count: number) => {
    setImportedCount(count);
    setStage('statement-success');
  };

  const goBack = () => setStage('select');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Add Transaction"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="relative w-full max-w-md rounded-3xl bg-ink-900 glass-strong card-ring overflow-hidden"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/8">
          <div>
            <AnimatePresence mode="wait">
              <motion.h3
                key={stage}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.15 }}
                className="font-display text-lg font-semibold text-mist-100 tracking-tight"
              >
                {editingTx ? 'Edit Transaction' : STAGE_TITLE[stage]}
              </motion.h3>
            </AnimatePresence>
            <p className="text-[11px] text-mist-500 mt-0.5">
              {stage === 'select'
                ? "Choose how you'd like to add your transaction"
                : stage === 'review'
                ? 'Review and edit the AI-extracted details before saving'
                : stage === 'statement-success'
                ? `Successfully imported ${importedCount} transaction${importedCount !== 1 ? 's' : ''}`
                : 'Fill in the transaction details'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-mist-500 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="px-6 py-5 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(90vh - 88px)' }}>
          <AnimatePresence mode="wait">

            {/* ── Method Selector ─────────────────────────── */}
            {stage === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="space-y-2"
              >
                {METHODS.map((m, i) => {
                  const Icon = m.icon;
                  return (
                    <motion.button
                      key={m.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      type="button"
                      onClick={() => setStage(m.id)}
                      className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border text-left transition-all group ${m.accent}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-mist-100">{m.label}</p>
                        <p className="text-[11px] text-mist-500 mt-0.5">{m.desc}</p>
                      </div>
                      <div className="ml-auto text-mist-500 group-hover:text-mist-300 transition-colors">›</div>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}

            {/* ── Manual Entry ─────────────────────────────── */}
            {stage === 'manual' && (
              <motion.div key="manual" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <ManualEntryMethod
                  editingTx={editingTx}
                  onSave={handleManualSave}
                  onCancel={editingTx ? onClose : goBack}
                />
              </motion.div>
            )}

            {/* ── Receipt Scan ──────────────────────────────── */}
            {stage === 'receipt' && (
              <motion.div key="receipt" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <ReceiptScanMethod
                  onExtracted={handleExtracted}
                  onCancel={goBack}
                />
              </motion.div>
            )}

            {/* ── Statement Import ──────────────────────────── */}
            {stage === 'statement' && (
              <motion.div key="statement" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <StatementImportMethod
                  onImported={handleStatementImported}
                  onCancel={goBack}
                />
              </motion.div>
            )}

            {/* ── SMS Parse ─────────────────────────────────── */}
            {stage === 'sms' && (
              <motion.div key="sms" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <SMSParseMethod
                  onExtracted={handleExtracted}
                  onCancel={goBack}
                />
              </motion.div>
            )}

            {/* ── Split with Friends ────────────────────────── */}
            {stage === 'split' && (
              <motion.div key="split" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <SplitPaymentMethod
                  onSave={handleManualSave}
                  onCancel={goBack}
                />
              </motion.div>
            )}

            {/* ── Review ────────────────────────────────────── */}
            {stage === 'review' && extracted && (
              <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <TransactionReviewForm
                  extracted={extracted}
                  isDuplicate={isDuplicate}
                  onSave={handleSaveExtracted}
                  onBack={() => setStage(extracted.source === 'sms' ? 'sms' : extracted.source === 'receipt' ? 'receipt' : 'select')}
                />
              </motion.div>
            )}

            {/* ── Statement Success ─────────────────────────── */}
            {stage === 'statement-success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
                  className="w-16 h-16 rounded-full bg-emerald-400/15 flex items-center justify-center"
                >
                  <FileSpreadsheet className="w-8 h-8 text-emerald-300" />
                </motion.div>
                <div>
                  <p className="text-base font-extrabold text-mist-100">Import Successful!</p>
                  <p className="text-xs text-mist-500 mt-1">
                    {importedCount} transaction{importedCount !== 1 ? 's' : ''} added to your ledger.
                  </p>
                </div>
                <div className="flex gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => setStage('select')}
                    className="flex-1 py-2.5 rounded-xl bg-white/8 hover:bg-white/12 text-mist-300 font-bold text-xs transition-all"
                  >
                    Import More
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
