import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { parseBankStatementFile, ExtractedStatementRow } from '../../../services/statementParser';
import { ImportPreviewTable } from './ImportPreviewTable';
import { useFinance } from '../../../context/FinanceContext';

interface StatementImporterProps {
  onBatchImport: (rows: ExtractedStatementRow[]) => void;
}

export const StatementImporter: React.FC<StatementImporterProps> = ({ onBatchImport }) => {
  const { transactions } = useFinance();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsingStep, setParsingStep] = useState('');
  const [parsedRows, setParsedRows] = useState<ExtractedStatementRow[] | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setIsParsing(true);
    setParsedRows(null);

    try {
      setParsingStep('Reading statement document...');
      await new Promise((r) => setTimeout(r, 400));

      setParsingStep('Parsing line items & transactions...');
      await new Promise((r) => setTimeout(r, 400));

      setParsingStep('Predicting categories & running duplicate check...');
      const rows = await parseBankStatementFile(selectedFile, transactions);

      await new Promise((r) => setTimeout(r, 300));
      setParsedRows(rows);
    } catch (err) {
      console.error(err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedRows(null);
    setIsParsing(false);
  };

  return (
    <div className="space-y-4">
      {!parsedRows && !isParsing && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-6 md:p-8 text-center transition-all duration-200 ${
            isDragging
              ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]'
              : 'border-slate-300 hover:border-emerald-500/60 bg-slate-50/80 hover:bg-emerald-50/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,.pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />

          <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-6 h-6 text-teal-600" />
          </div>

          <h4 className="text-sm font-bold text-slate-800 mb-1">
            Import Bank Statement (CSV, Excel, PDF)
          </h4>
          <p className="text-xs text-slate-500 mb-3 max-w-sm mx-auto">
            Upload statements from HDFC, SBI, ICICI, Axis, or international banks. Savorah AI will parse and auto-categorize all transactions.
          </p>

          <span className="inline-flex px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm items-center gap-1.5 transition-all">
            <Upload className="w-3.5 h-3.5" /> Choose Statement File
          </span>
        </div>
      )}

      {/* Parsing Animation */}
      {isParsing && (
        <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-xl text-center space-y-3 animate-in fade-in duration-200">
          <div className="w-10 h-10 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <h4 className="text-sm font-extrabold text-white">AI Statement Parsing Engine Active</h4>
          <p className="text-xs text-emerald-400 font-semibold">{parsingStep}</p>
        </div>
      )}

      {/* Statement Table View */}
      {parsedRows && (
        <ImportPreviewTable
          rows={parsedRows}
          onImportSelected={onBatchImport}
          onCancel={handleReset}
        />
      )}
    </div>
  );
};
