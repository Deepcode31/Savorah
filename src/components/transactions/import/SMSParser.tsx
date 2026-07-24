import React, { useState } from 'react';
import { Smartphone, Sparkles, MessageSquare, ArrowRight } from 'lucide-react';
import { parsePaymentSMS, ExtractedTransactionData } from '../../../services/smsParser';
import { AIExtractionCard } from './AIExtractionCard';
import { checkDuplicateTransaction, DuplicateCheckResult } from '../../../services/duplicateChecker';
import { useFinance } from '../../../context/FinanceContext';

interface SMSParserProps {
  onTransactionExtracted: (data: ExtractedTransactionData) => void;
}

export const SMSParser: React.FC<SMSParserProps> = ({ onTransactionExtracted }) => {
  const { transactions } = useFinance();
  const [smsText, setSmsText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedTransactionData | null>(null);
  const [duplicateCheck, setDuplicateCheck] = useState<DuplicateCheckResult | undefined>(undefined);

  const sampleMessages = [
    'Rs.560 spent using SBI Credit Card at Reliance Fresh on 23 Jul 2026.',
    '₹1,250 paid to Swiggy via UPI Ref No. 491023910.',
    'Salary ₹85,000 credited to HDFC A/C on 01 Jul 2026.',
    'INR 1,850.00 debited from A/C XX8912 for Electricity Bill payment.',
  ];

  const handleAnalyze = async () => {
    if (!smsText.trim()) return;
    setIsAnalyzing(true);
    setExtractedData(null);

    await new Promise((r) => setTimeout(r, 600));

    const result = parsePaymentSMS(smsText);
    const dupCheck = checkDuplicateTransaction(
      { title: result.title, amount: result.amount, date: result.date, type: result.type },
      transactions
    );

    setExtractedData(result);
    setDuplicateCheck(dupCheck);
    setIsAnalyzing(false);
  };

  const handleReset = () => {
    setSmsText('');
    setExtractedData(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-4">
      {!extractedData && (
        <div className="space-y-3">
          {/* Sample Chips */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Try Sample SMS Messages
            </label>
            <div className="flex flex-wrap gap-1.5">
              {sampleMessages.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSmsText(sample)}
                  className="text-left py-1 px-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 text-[11px] font-medium text-slate-700 transition-all truncate max-w-full"
                >
                  "{sample}"
                </button>
              ))}
            </div>
          </div>

          {/* SMS Input Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Paste Payment SMS or UPI Alert
            </label>
            <div className="relative">
              <textarea
                rows={4}
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                placeholder={`Paste your payment message here...\n\nExample:\nRs.560 spent using SBI Credit Card at Reliance Fresh on 23 Jul 2026.\n\nor\n\n₹1,250 paid to Swiggy via UPI Ref No. XXXXX`}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Analyze Button */}
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !smsText.trim()}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 text-emerald-300 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Extracting Transaction Details...' : '✨ Analyze Message with AI'}
          </button>
        </div>
      )}

      {/* Extracted Review */}
      {extractedData && (
        <AIExtractionCard
          extractedData={extractedData}
          duplicateCheck={duplicateCheck}
          onSave={onTransactionExtracted}
          onReset={handleReset}
        />
      )}
    </div>
  );
};
