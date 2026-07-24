import React, { useCallback, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Upload, File, X, Camera, ImageIcon } from 'lucide-react';
import { CameraCapture } from '../../shared/CameraCapture';

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label?: string;
  sublabel?: string;
  acceptedTypes?: string[];
  file?: File | null;
  onClear?: () => void;
  previewUrl?: string | null;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFileSelect,
  accept = 'image/*,.pdf',
  label = 'Drop your file here',
  sublabel = 'JPG, PNG, PDF supported',
  acceptedTypes = ['JPG', 'PNG', 'PDF'],
  file,
  onClear,
  previewUrl,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) onFileSelect(f);
    },
    [onFileSelect]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFileSelect(f);
    e.target.value = '';
  };

  const handleCameraCapture = (capturedFile: File) => {
    onFileSelect(capturedFile);
  };

  if (file) {
    return (
      <>
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-2xl border border-emerald-400/25 bg-emerald-400/10 overflow-hidden"
        >
          {previewUrl && file.type.startsWith('image/') && (
            <div className="relative">
              <img src={previewUrl} alt="Receipt preview" className="w-full max-h-40 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent" />
              <div className="absolute bottom-2 left-3">
                <span className="text-white text-[10px] font-bold bg-emerald-600/80 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                  Preview
                </span>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 p-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-400/15 flex items-center justify-center shrink-0">
              {file.type.startsWith('image/') ? (
                <ImageIcon className="w-4 h-4 text-emerald-300" />
              ) : (
                <File className="w-4 h-4 text-emerald-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-mist-100 truncate">{file.name}</p>
              <p className="text-[10px] text-emerald-300 font-medium">
                {(file.size / 1024).toFixed(1)} KB · Ready to process
              </p>
            </div>
            {onClear && (
              <button
                onClick={onClear}
                className="p-1.5 rounded-lg hover:bg-emerald-400/18 text-mist-500 hover:text-mist-100 transition-all"
                aria-label="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>

        <CameraCapture
          isOpen={cameraOpen}
          onCapture={handleCameraCapture}
          onClose={() => setCameraOpen(false)}
          facingMode="environment"
          title="Scan Receipt"
          hint="Position the receipt clearly in frame, then capture."
        />
      </>
    );
  }

  return (
    <div>
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        animate={{
          borderColor: isDragging ? '#10B981' : '#CBD5E1',
          backgroundColor: isDragging ? '#f0fdf4' : '#f8fafc',
          scale: isDragging ? 1.01 : 1,
        }}
        transition={{ duration: 0.15 }}
        className="relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center hover:border-emerald-400/50 hover:bg-emerald-400/12/50 group transition-colors"
        role="button"
        tabIndex={0}
        aria-label="Upload file"
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleChange}
          aria-label="File upload input"
        />
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{ scale: isDragging ? 1.12 : 1, rotate: isDragging ? 5 : 0 }}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
              isDragging ? 'bg-emerald-400/15' : 'bg-white/8 group-hover:bg-emerald-400/12'
            }`}
          >
            <Upload
              className={`w-6 h-6 transition-colors ${
                isDragging ? 'text-emerald-300' : 'text-mist-500 group-hover:text-emerald-500'
              }`}
            />
          </motion.div>

          <div>
            <p className="text-sm font-bold text-mist-300">{label}</p>
            <p className="text-[11px] text-mist-500 mt-0.5">{sublabel}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-400/120 transition-colors shadow-sm shadow-emerald-600/20"
            >
              Browse Files
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCameraOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-[11px] font-bold hover:bg-slate-700 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Camera className="w-3.5 h-3.5" />
              Camera
            </button>
          </div>

          <div className="flex gap-1.5 flex-wrap justify-center">
            {acceptedTypes.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-lg bg-white/8 text-[10px] font-semibold text-mist-500">
                {t}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Live camera capture modal */}
      <CameraCapture
        isOpen={cameraOpen}
        onCapture={handleCameraCapture}
        onClose={() => setCameraOpen(false)}
        facingMode="environment"
        title="Scan Receipt"
        hint="Position the receipt clearly in frame, then capture."
      />
    </div>
  );
};
