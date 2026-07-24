import React from 'react';
import { PenTool, Camera, FileSpreadsheet, Smartphone } from 'lucide-react';

export type ImportMethod = 'manual' | 'receipt' | 'statement' | 'sms';

interface TransactionMethodSelectorProps {
  activeMethod: ImportMethod;
  onMethodChange: (method: ImportMethod) => void;
}

export const TransactionMethodSelector: React.FC<TransactionMethodSelectorProps> = ({
  activeMethod,
  onMethodChange,
}) => {
  const methods = [
    {
      id: 'manual' as ImportMethod,
      label: 'Manual Entry',
      subtitle: 'Standard Form',
      icon: <PenTool className="w-4 h-4" />,
    },
    {
      id: 'receipt' as ImportMethod,
      label: 'Scan Receipt',
      subtitle: 'OCR AI Scan',
      icon: <Camera className="w-4 h-4" />,
    },
    {
      id: 'statement' as ImportMethod,
      label: 'Bank Statement',
      subtitle: 'CSV / Excel',
      icon: <FileSpreadsheet className="w-4 h-4" />,
    },
    {
      id: 'sms' as ImportMethod,
      label: 'Payment SMS',
      subtitle: 'UPI / Bank Alert',
      icon: <Smartphone className="w-4 h-4" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 mb-5">
      {methods.map((m) => {
        const isActive = activeMethod === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onMethodChange(m.id)}
            className={`flex flex-col items-center justify-center py-2 px-2 rounded-xl text-xs font-bold transition-all ${
              isActive
                ? 'bg-white text-emerald-800 shadow-sm border border-emerald-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <div className={`p-1 rounded-lg mb-0.5 ${isActive ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500'}`}>
              {m.icon}
            </div>
            <span className="leading-none text-[11px] font-extrabold">{m.label}</span>
            <span className="text-[9px] text-slate-400 font-medium mt-0.5">{m.subtitle}</span>
          </button>
        );
      })}
    </div>
  );
};
