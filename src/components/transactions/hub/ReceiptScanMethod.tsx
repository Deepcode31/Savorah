import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScanLine, Loader2 } from 'lucide-react';
import { UploadDropzone } from './UploadDropzone';
import { parseReceiptImage, ExtractedTransaction } from '../../../services/transactionImportServices';

interface ReceiptScanMethodProps {
  onExtracted: (tx: ExtractedTransaction) => void;
  onCancel: () => void;
}

export const ReceiptScanMethod: React.FC<ReceiptScanMethodProps> = ({ onExtracted, onCancel }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFile = (f: File) => {
    setFile(f);
    setError('');
    if (f.type.startsWith('image/')) setPreviewUrl(URL.createObjectURL(f));
    else setPreviewUrl(null);
  };

  const handleStartScan = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const result = await parseReceiptImage(file);
      onExtracted(result);
    } catch (e: any) {
      setError(e?.message || 'Receipt scan failed. Use a clear photo or check OPENROUTER_API_KEY.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 py-10 rounded-2xl bg-white/5 border border-white/10"
          >
            <Loader2 className="w-8 h-8 text-emerald-300 animate-spin" />
            <p className="text-sm font-semibold text-mist-100">Reading receipt with AI…</p>
            <p className="text-xs text-mist-500">Extracting merchant, amount, and category</p>
          </motion.div>
        ) : (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <UploadDropzone
              onFileSelect={handleFile}
              accept="image/*"
              label="Drop your receipt photo here"
              sublabel="JPG or PNG works best"
              acceptedTypes={['JPG', 'PNG']}
              file={file}
              previewUrl={previewUrl}
              onClear={() => {
                setFile(null);
                setPreviewUrl(null);
                setError('');
              }}
            />
            {error && (
              <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-100 rounded-xl px-3 py-2">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white/8 text-mist-300 font-semibold text-xs"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleStartScan}
                disabled={!file}
                className="flex-[2] py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-semibold text-xs disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <ScanLine className="w-4 h-4" />
                Scan with AI
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
