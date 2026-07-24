import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, X, RotateCcw, ZoomIn, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';

interface CameraCaptureProps {
  isOpen: boolean;
  onCapture: (file: File) => void;
  onClose: () => void;
  /** 'user' = front/selfie, 'environment' = rear/document. Default: 'environment' */
  facingMode?: 'user' | 'environment';
  title?: string;
  hint?: string;
}

type Stage = 'requesting' | 'live' | 'captured' | 'denied' | 'unavailable';

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  isOpen,
  onCapture,
  onClose,
  facingMode: initialFacing = 'environment',
  title = 'Take a Photo',
  hint = 'Position your document in the frame, then tap Capture.',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [stage, setStage] = useState<Stage>('requesting');
  const [facing, setFacing] = useState<'user' | 'environment'>(initialFacing);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [flash, setFlash] = useState(false);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(
    async (mode: 'user' | 'environment') => {
      stopStream();
      setStage('requesting');
      setCapturedUrl(null);
      setCapturedFile(null);

      if (!navigator.mediaDevices?.getUserMedia) {
        setStage('unavailable');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStage('live');
      } catch (err: unknown) {
        const e = err as { name?: string };
        if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
          setStage('denied');
        } else {
          setStage('unavailable');
        }
      }
    },
    [stopStream]
  );

  // Start/stop when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      startCamera(facing);
    } else {
      stopStream();
      setStage('requesting');
      setCapturedUrl(null);
      setCapturedFile(null);
    }
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleFlip = () => {
    const next = facing === 'user' ? 'environment' : 'user';
    setFacing(next);
    startCamera(next);
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror front camera
    if (facing === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);

    // Flash effect
    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const file = new File([blob], `camera-capture-${ts}.jpg`, { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      setCapturedUrl(url);
      setCapturedFile(file);
      setStage('captured');
      stopStream();
    }, 'image/jpeg', 0.92);
  };

  const handleRetake = () => {
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedUrl(null);
    setCapturedFile(null);
    startCamera(facing);
  };

  const handleConfirm = () => {
    if (capturedFile) {
      onCapture(capturedFile);
      onClose();
    }
  };

  const handleClose = () => {
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    stopStream();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-900/80 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-600/20 flex items-center justify-center">
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-white">{title}</p>
              <p className="text-[10px] text-mist-500">{hint}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-mist-500 hover:text-white hover:bg-slate-700 transition-all"
            aria-label="Close camera"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder */}
        <div className="relative bg-black aspect-[4/3] overflow-hidden">
          {/* Live video */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${
              facing === 'user' ? 'scale-x-[-1]' : ''
            } ${stage === 'live' ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Captured image */}
          {capturedUrl && (
            <img
              src={capturedUrl}
              alt="Captured"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Flash overlay */}
          <AnimatePresence>
            {flash && (
              <motion.div
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-white/8 pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Loading / permission states */}
          {(stage === 'requesting' || stage === 'denied' || stage === 'unavailable') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
              {stage === 'requesting' && (
                <>
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  <p className="text-sm font-semibold text-mist-500">Starting camera…</p>
                </>
              )}
              {stage === 'denied' && (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/100/20 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-rose-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Camera Access Denied</p>
                    <p className="text-[11px] text-mist-500 mt-1">
                      Allow camera access in your browser settings, then try again.
                    </p>
                  </div>
                  <button
                    onClick={() => startCamera(facing)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-400/120 text-white text-xs font-bold transition-all"
                  >
                    Try Again
                  </button>
                </>
              )}
              {stage === 'unavailable' && (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-slate-700 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-mist-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Camera Unavailable</p>
                    <p className="text-[11px] text-mist-500 mt-1">
                      No camera found or the browser blocked access. Use "Browse Files" instead.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Corner guides (live only) */}
          {stage === 'live' && (
            <>
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg opacity-70" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg opacity-70" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg opacity-70" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br-lg opacity-70" />
            </>
          )}

          {/* Captured checkmark overlay */}
          {stage === 'captured' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-emerald-400/100 flex items-center justify-center shadow-lg"
            >
              <CheckCircle2 className="w-5 h-5 text-white" />
            </motion.div>
          )}
        </div>

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Controls */}
        <div className="px-5 py-4 bg-slate-900 flex items-center justify-between gap-3">
          {stage === 'live' && (
            <>
              {/* Flip camera */}
              <button
                onClick={handleFlip}
                className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 text-mist-500 hover:text-white flex items-center justify-center transition-all"
                aria-label="Flip camera"
                title="Switch camera"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Shutter */}
              <motion.button
                onClick={handleCapture}
                whileTap={{ scale: 0.92 }}
                className="w-16 h-16 rounded-full bg-white/8 hover:bg-emerald-400/12 border-4 border-white/15 hover:border-emerald-400/50 shadow-lg flex items-center justify-center transition-all"
                aria-label="Capture photo"
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 hover:bg-emerald-600 transition-colors" />
              </motion.button>

              {/* Zoom hint */}
              <div
                className="w-10 h-10 rounded-full bg-slate-700 text-mist-500 flex items-center justify-center"
                title="Pinch to zoom on mobile"
              >
                <ZoomIn className="w-4 h-4" />
              </div>
            </>
          )}

          {stage === 'captured' && (
            <>
              <button
                onClick={handleRetake}
                className="flex-1 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Retake
              </button>
              <motion.button
                onClick={handleConfirm}
                whileTap={{ scale: 0.97 }}
                className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Use This Photo
              </motion.button>
            </>
          )}

          {(stage === 'denied' || stage === 'unavailable' || stage === 'requesting') && (
            <button
              onClick={handleClose}
              className="w-full py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-all"
            >
              Close
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
