import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Sparkles, Loader2 } from 'lucide-react';
import { parseSMS, ExtractedTransaction } from '../../../services/transactionImportServices';

const EXAMPLE_SMS = [
  'Rs.560 spent using SBI Credit Card at Reliance Fresh on 23 Jul 2026.',
  '₹1,250 paid to Swiggy via UPI Ref No. 123456789.',
  'Your account is debited by Rs.2,399 for Amazon India on 22-Jul-2026. Available balance: Rs.14,250.',
  'Dear customer, Rs.649 credited to Netflix via Debit Card on 20/07/2026.',
];

interface SMSParseMethodProps {
  onExtracted: (tx: ExtractedTransaction) => void;
  onCancel: () => void;
}

export const SMSParseMethod: React.FC<SMSParseMethodProps> = ({ onExtracted, onCancel }) => {
  const [smsText, setSmsText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [typingDots, setTypingDots] = useState('');
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!smsText.trim()) return;
    setIsAnalyzing(true);
    setError('');

    // Typing animation
    let count = 0;
    const dotInterval = setInterval(() => {
      count++;
      setTypingDots('.'.repeat((count % 3) + 1));
    }, 350);

    try {
      const result = await parseSMS(smsText);
      clearInterval(dotInterval);
      setIsAnalyzing(false);
      onExtracted(result);
    } catch (e) {
      clearInterval(dotInterval);
      setIsAnalyzing(false);
      setError(e instanceof Error ? e.message : 'Could not parse SMS. Check AI key or try again.');
    }
  };

  const pasteExample = (ex: string) => setSmsText(ex);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Textarea */}
      <div>
        <label className="block text-xs font-semibold text-mist-300 mb-1.5">
          Paste your payment message
        </label>
        <textarea
          value={smsText}
          onChange={(e) => setSmsText(e.target.value)}
          rows={5}
          placeholder={
            'Paste your payment message here…\n\nExamples:\n• Rs.560 spent using SBI Credit Card at Reliance Fresh on 23 Jul 2026.\n• ₹1,250 paid to Swiggy via UPI Ref No. XXXXX'
          }
          disabled={isAnalyzing}
          className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-mist-100 focus:outline-none focus:border-emerald-400/60 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none font-mono leading-relaxed placeholder:font-sans placeholder:text-mist-500 disabled:opacity-60"
        />
        {error && (
          <p className="mt-2 text-xs text-rose-300 bg-rose-500/10 border border-rose-100 rounded-xl px-3 py-2">
            {error}
          </p>
        )}
      </div>

      {/* Example SMS pills */}
      <div>
        <p className="text-[10px] font-bold text-mist-500 uppercase tracking-wide mb-2">Try an example</p>
        <div className="flex flex-col gap-1.5">
          {EXAMPLE_SMS.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => pasteExample(ex)}
              disabled={isAnalyzing}
              className="text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-emerald-400/12 border border-white/10 hover:border-emerald-400/50/40 text-[11px] text-mist-300 hover:text-emerald-200 transition-all font-mono truncate disabled:opacity-50"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Supported providers */}
      <div className="flex flex-wrap gap-1.5">
        {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI', 'Bank SMS', 'Credit Card SMS'].map((p) => (
          <span key={p} className="px-2.5 py-1 rounded-lg bg-white/8 text-[10px] font-semibold text-mist-500">
            {p}
          </span>
        ))}
      </div>

      {/* AI analyzing state */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-400/10 border border-emerald-400/25"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-400/15 flex items-center justify-center shrink-0">
              <Loader2 className="w-4 h-4 text-emerald-300 animate-spin" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-200">Savorah AI is analyzing{typingDots}</p>
              <p className="text-[10px] text-emerald-300 mt-0.5">Extracting amount, merchant, date &amp; payment method</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isAnalyzing}
          className="flex-1 py-2.5 px-4 rounded-xl bg-white/8 hover:bg-white/12 text-mist-300 font-bold text-xs transition-all disabled:opacity-50"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!smsText.trim() || isAnalyzing}
          className="flex-[2] py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {isAnalyzing ? `Analyzing${typingDots}` : '✨ Analyze Message'}
        </button>
      </div>
    </motion.div>
  );
};
