import React from 'react';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface ConfidenceBadgeProps {
  score: number; // 0 - 100
  showLabel?: boolean;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ score, showLabel = true }) => {
  let color = 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30';
  let icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
  let label = 'High AI Confidence';

  if (score < 80) {
    color = 'bg-amber-500/10 text-amber-700 border-amber-500/30';
    icon = <AlertCircle className="w-3.5 h-3.5 text-amber-600" />;
    label = 'Review Required';
  } else if (score < 90) {
    color = 'bg-teal-500/10 text-teal-700 border-teal-500/30';
    icon = <Sparkles className="w-3.5 h-3.5 text-teal-600" />;
    label = 'Good AI Match';
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold transition-all shadow-sm ${color}`}
      title={`AI Extraction Confidence Score: ${score}%`}
    >
      {icon}
      <span>{score}%</span>
      {showLabel && <span className="opacity-80 font-semibold">({label})</span>}
    </div>
  );
};
