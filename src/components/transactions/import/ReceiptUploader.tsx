import React, { useState, useRef } from 'react';
import { Camera, Upload, FileText, Sparkles, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { parseReceiptImage, OCRStepProgress } from '../../../services/receiptParser';
import { ExtractedTransactionData } from '../../../services/smsParser';
import { AIExtractionCard } from './AIExtractionCard';
import { checkDuplicateTransaction, DuplicateCheckResult } from '../../../services/duplicateChecker';
import { useFinance } from '../../../context/FinanceContext';

interface ReceiptUploaderProps {
  onTransactionExtracted: (data: ExtractedTransactionData) => void;
}

export const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({ onTransactionExtracted }) => {
  const { transactions } = useFinance();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<OCRStepProgress | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedTransactionData | null>(null);
  const [duplicateCheck, setDuplicateCheck] = useState<DuplicateCheckResult | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile) return;
    setFile(selectedFile);

    // Create preview if image
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(null);
    }

    // Start OCR extraction process
    setIsProcessing(true);
    setExtractedData(null);

    try {
      const data = await parseReceiptImage(selectedFile, (p) => setProgress(p));
      
      const dupRes = checkDuplicateTransaction(
        { title: data.title, amount: data.amount, date: data.date, type: data.type },
        transactions
      );
      
      setExtractedData(data);
      setDuplicateCheck(dupRes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
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
    setPreviewUrl(null);
    setExtractedData(null);
    setProgress(null);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-4">
      {!extractedData && !isProcessing && (
        <div className="space-y-3">
          {/* Upload Dropzone */}
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
              accept="image/png,image/jpeg,image/jpg,application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />

            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-emerald-600" />
            </div>

            <h4 className="text-sm font-bold text-slate-800 mb-1">
              Drag & Drop Bank Receipt or Bill
            </h4>
            <p className="text-xs text-slate-500 mb-3 max-w-xs mx-auto">
              Supports JPG, PNG, JPEG or PDF format receipts. Savorah AI will auto-extract merchant, amount, date & category.
            </p>

            <div className="flex items-center justify-center gap-2 pt-1">
              <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm flex items-center gap-1.5 hover:bg-slate-50">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-600" /> Browse File
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cameraInputRef.current?.click();
                }}
                className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Camera className="w-3.5 h-3.5" /> Take Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OCR AI Scanning Progress */}
      {isProcessing && (
        <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                <Sparkles className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  AI Receipt Scanner Active
                </h4>
                <p className="text-sm font-extrabold text-white">
                  {progress?.label || 'Processing document...'}
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-slate-400">
              Step {progress?.step || 1} / {progress?.totalSteps || 6}
            </span>
          </div>

          {/* Animated Scanning Beam & Preview */}
          <div className="relative h-36 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center">
            {previewUrl ? (
              <img src={previewUrl} alt="Receipt preview" className="h-full object-cover opacity-60" />
            ) : (
              <div className="text-center p-4">
                <FileText className="w-10 h-10 text-emerald-400/60 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">{file?.name}</p>
              </div>
            )}

            {/* Glowing Scan Line Beam */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-bounce top-1/3" />
          </div>

          {/* Step Progress Bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{
                width: `${((progress?.step || 1) / (progress?.totalSteps || 6)) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Extracted Result Review */}
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
