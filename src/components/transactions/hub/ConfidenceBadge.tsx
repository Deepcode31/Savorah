import React from 'react';
import { Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ConfidenceBadgeProps {
  score: number; // 0-100
  className?: string;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ score, className = '' }) => {
  if (score >= 88) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-400/15 border border-emerald-400/25 text-emerald-300 text-[11px] font-bold ${className}`}>
        <CheckCircle2 className="w-3 h-3" />
        AI Confidence {score}%
      </span>
    );
  }
  if (score >= 70) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-400/15 border border-amber-400/25 text-amber-300 text-[11px] font-bold ${className}`}>
        <Sparkles className="w-3 h-3" />
        AI Confidence {score}% — Review suggested
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-500/15 border border-rose-400/25 text-rose-300 text-[11px] font-bold ${className}`}>
      <AlertTriangle className="w-3 h-3" />
      Low Confidence {score}% — Please verify
    </span>
  );
};
