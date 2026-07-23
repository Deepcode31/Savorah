import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles, Download, Layers, ShieldCheck } from 'lucide-react';

export const AIVisionBoard: React.FC = () => {
  const [prompt, setPrompt] = useState('Dream Japanese Ryokan Villa Vacation');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800'
  );
  const [note, setNote] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setNote('');

    try {
      const res = await fetch('/api/gemini/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          aspectRatio,
          imageSize,
        }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      }
      if (data.textNote) {
        setNote(data.textNote);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md">
            <ImageIcon className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            AI Financial Vision Board & Goal Visualizer
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Generate high-quality visual cards using Gemini Nano Banana models to keep you motivated on your financial journey.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100">
            Vision Board Generator Config
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Financial Goal Prompt
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              placeholder="e.g. Dream house near coastal mountains with solar panels"
            />
          </div>

          {/* Resolution Selector (1K, 2K, 4K) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Image Resolution Affordance</span>
              <span className="text-[10px] text-emerald-700 font-bold">
                gemini-3.1-flash-image
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['1K', '2K', '4K'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setImageSize(sz)}
                  className={`py-2 text-xs font-extrabold rounded-xl border transition-all ${
                    imageSize === sz
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['1:1', '16:9', '9:16'].map((ar) => (
                <button
                  key={ar}
                  type="button"
                  onClick={() => setAspectRatio(ar)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    aspectRatio === ar
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {ar}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Rendering {imageSize} Vision Card...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Goal Vision Board
              </>
            )}
          </button>
        </div>

        {/* Display Canvas */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-500/15 shadow-xl shadow-emerald-950/5 flex flex-col items-center justify-center min-h-[380px]">
          {generatedImage ? (
            <div className="relative group w-full max-w-md overflow-hidden rounded-2xl border-2 border-emerald-500/30 shadow-2xl">
              <img
                src={generatedImage}
                alt="AI Financial Vision Card"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent p-4 flex flex-col justify-end">
                <div className="text-white font-bold text-sm">{prompt}</div>
                <div className="text-[10px] text-emerald-300 font-semibold flex items-center gap-2">
                  <span>Rendered: {imageSize} ({aspectRatio})</span>
                  <span>• Savorah AI Vision Card</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 text-xs">
              Click Generate to render your goal vision card.
            </div>
          )}

          {note && <p className="text-xs text-slate-600 mt-3 italic">{note}</p>}
        </div>
      </div>
    </div>
  );
};
