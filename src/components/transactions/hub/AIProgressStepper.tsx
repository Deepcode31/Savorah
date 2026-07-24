import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Loader2 } from 'lucide-react';

export interface ProgressStep {
  label: string;
  duration: number; // ms
}

interface AIProgressStepperProps {
  steps: ProgressStep[];
  onComplete: () => void;
  title?: string;
  icon?: React.ReactNode;
}

export const AIProgressStepper: React.FC<AIProgressStepperProps> = ({
  steps,
  onComplete,
  title = 'AI Processing',
  icon,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let idx = 0;

    const advance = () => {
      if (cancelled) return;
      if (idx >= steps.length) {
        setDone(true);
        setTimeout(() => { if (!cancelled) onComplete(); }, 300);
        return;
      }
      setCurrentStep(idx);
      setTimeout(() => {
        if (cancelled) return;
        setCompletedSteps((prev) => new Set([...prev, idx]));
        idx++;
        advance();
      }, steps[idx].duration);
    };

    advance();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = steps.length;
  const completed = completedSteps.size;
  const progressPct = done ? 100 : Math.round((completed / total) * 100);

  return (
    <div className="py-2">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        {icon && (
          <div className="w-8 h-8 rounded-xl bg-emerald-400/15 flex items-center justify-center text-emerald-300">
            {icon}
          </div>
        )}
        <div>
          <p className="text-xs font-extrabold text-mist-100">{title}</p>
          <p className="text-[10px] text-mist-500">{done ? 'Complete!' : 'Please wait…'}</p>
        </div>
        <div className="ml-auto">
          <span className="text-xs font-black text-emerald-300">{progressPct}%</span>
        </div>
      </div>

      {/* Global progress bar */}
      <div className="h-1.5 rounded-full bg-white/8 mb-4 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
          initial={{ width: '0%' }}
          animate={{ width: `${progressPct}%` }}
          transition={{ ease: 'easeOut', duration: 0.4 }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-1.5">
        {steps.map((step, i) => {
          const isCompleted = completedSteps.has(i);
          const isCurrent = currentStep === i && !isCompleted && !done;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: i <= currentStep || done ? 1 : 0.3, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.2 }}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                isCurrent ? 'bg-emerald-400/10 border border-emerald-400/25/80' : ''
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                {isCompleted || done ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                  </motion.div>
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                )}
              </div>

              <span
                className={`text-[11px] font-semibold flex-1 ${
                  isCompleted || done
                    ? 'text-emerald-300'
                    : isCurrent
                    ? 'text-mist-100'
                    : 'text-mist-500'
                }`}
              >
                {step.label}
              </span>

              {isCurrent && (
                <div className="w-12 h-1 rounded-full bg-emerald-400/15 overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald-400/100 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: step.duration / 1000, ease: 'linear' }}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
