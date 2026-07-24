import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight, Camera, GraduationCap, Briefcase, Users, Heart,
  IndianRupee, User as UserIcon, AlertCircle, LogOut, Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserPersona } from '../../types';
import { Logo } from '../../components/brand/Logo';
import { ThemeToggle } from '../../components/brand/ThemeToggle';

const PERSONA_OPTIONS: Array<{
  id: UserPersona;
  label: string;
  desc: string;
  icon: React.FC<{ className?: string }>;
  color: string;
}> = [
  { id: 'student', label: 'Student', desc: 'Pocket money & campus life', icon: GraduationCap, color: 'text-teal-300' },
  { id: 'professional', label: 'Professional', desc: 'Salary, SIPs & growth', icon: Briefcase, color: 'text-emerald-300' },
  { id: 'family', label: 'Family', desc: 'Household & kids', icon: Users, color: 'text-amber-300' },
  { id: 'senior', label: 'Senior', desc: 'Pension & peace of mind', icon: Heart, color: 'text-violet-300' },
];

const AVATAR_STYLES = ['adventurer', 'avataaars', 'open-peeps', 'big-smile', 'lorelei', 'notionists'] as const;

function dicebearUrl(style: string, seed: string) {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}

async function fileToAvatarDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const size = 160;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not process image');

  const scale = Math.max(size / bitmap.width, size / bitmap.height);
  const w = bitmap.width * scale;
  const h = bitmap.height * scale;
  ctx.drawImage(bitmap, (size - w) / 2, (size - h) / 2, w, h);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.85);
}

const inputCls =
  'w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-mist-100 placeholder:text-mist-500 focus:outline-none focus:border-emerald-400/60 focus:bg-white/8 transition-all';

const OnboardingScreen: React.FC = () => {
  const { currentUser, completeOnboarding, logout } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const defaultSeed = currentUser?.email || currentUser?.name || 'savorah';
  const presetAvatars = useMemo(
    () => AVATAR_STYLES.map((style) => dicebearUrl(style, defaultSeed)),
    [defaultSeed]
  );

  const [name, setName] = useState(currentUser?.name || '');
  const [persona, setPersona] = useState<UserPersona>(currentUser?.persona || 'professional');
  const [monthlyIncome, setMonthlyIncome] = useState(
    String(currentUser?.monthlyIncome && currentUser.monthlyIncome > 0 ? currentUser.monthlyIncome : 45000)
  );
  const [avatar, setAvatar] = useState(
    currentUser?.avatar || presetAvatars[0]
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    try {
      setError(null);
      const dataUrl = await fileToAvatarDataUrl(file);
      setAvatar(dataUrl);
    } catch {
      setError('Could not read that image. Try another photo.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter your name.');
      return;
    }
    const income = Number(monthlyIncome);
    if (!Number.isFinite(income) || income < 0) {
      setError('Enter a valid monthly income.');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await completeOnboarding({
        name: trimmed,
        avatar,
        persona,
        monthlyIncome: income,
        useAiBudget: true,
        goals: [],
      });
    } catch (err: any) {
      setError(err?.message || 'Could not finish setting up your profile.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-persona={persona} className="min-h-screen bg-ink-950 text-mist-100 flex items-stretch relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-[44rem] h-[44rem] rounded-full bg-emerald-600/12 blur-[140px] animate-aurora" aria-hidden />
      <div className="absolute bottom-0 right-0 w-[36rem] h-[36rem] rounded-full bg-indigo-500/10 blur-[130px] animate-aurora" style={{ animationDelay: '-7s' }} aria-hidden />
      <div className="absolute inset-0 grid-fade opacity-60" aria-hidden />

      <div className="absolute top-5 right-5 z-10 flex items-center gap-2">
        <ThemeToggle />
      </div>

      <div className="hidden lg:flex flex-col justify-between w-[42%] p-12 relative">
        <Logo size={40} wordmarkClassName="text-xl" />
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-4xl xl:text-5xl font-semibold leading-[1.08] tracking-tight"
          >
            Tell us who
            <br />
            <span className="accent-text">you’re moneying for.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8 }}
            className="text-mist-500 mt-5 max-w-sm leading-relaxed"
          >
            We’ll tailor budgets, insights, and coaching to your life stage — takes under a minute.
          </motion.p>
        </div>
        <p className="text-sm text-mist-500">
          Signed in as <span className="text-mist-300">{currentUser?.email}</span>
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8">
            <Logo size={34} wordmarkClassName="text-lg" />
            <p className="text-xs text-mist-500 mt-3 truncate">{currentUser?.email}</p>
          </div>

          <form onSubmit={handleSubmit} className="glass-strong card-ring rounded-3xl p-8 space-y-5">
            <div>
              <h2 className="font-display text-2xl font-semibold">Create your profile</h2>
              <p className="text-sm text-mist-500 mt-1.5">
                Name, photo, and life stage — so Savorah feels like yours from day one.
              </p>
            </div>

            {/* Avatar */}
            <div>
              <p className="text-xs font-semibold text-mist-500 uppercase tracking-widest mb-3">Profile picture</p>
              <div className="flex items-center gap-4 mb-3">
                <div className="relative shrink-0">
                  <img
                    src={avatar}
                    alt=""
                    className="w-20 h-20 rounded-2xl object-cover bg-white/8 border border-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-xl btn-accent flex items-center justify-center"
                    aria-label="Upload photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUpload}
                  />
                </div>
                <p className="text-xs text-mist-500 leading-relaxed">
                  Upload a photo or pick an avatar below
                  {currentUser?.isGoogleUser ? ' — we prefilled your Google picture.' : '.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentUser?.avatar && !currentUser.avatar.includes('dicebear.com') && (
                  <button
                    type="button"
                    onClick={() => setAvatar(currentUser.avatar!)}
                    className={`relative w-11 h-11 rounded-xl overflow-hidden border transition-all ${
                      avatar === currentUser.avatar
                        ? 'border-emerald-400/70 ring-2 ring-emerald-400/30'
                        : 'border-white/10 hover:border-white/25'
                    }`}
                    aria-label="Use Google photo"
                  >
                    <img src={currentUser.avatar} alt="" className="w-full h-full object-cover" />
                    {avatar === currentUser.avatar && (
                      <span className="absolute inset-0 bg-emerald-500/25 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </span>
                    )}
                  </button>
                )}
                {presetAvatars.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setAvatar(url)}
                    className={`relative w-11 h-11 rounded-xl overflow-hidden border transition-all ${
                      avatar === url
                        ? 'border-emerald-400/70 ring-2 ring-emerald-400/30'
                        : 'border-white/10 hover:border-white/25'
                    }`}
                    aria-label="Choose avatar"
                  >
                    <img src={url} alt="" className="w-full h-full object-cover bg-white/5" />
                    {avatar === url && (
                      <span className="absolute inset-0 bg-emerald-500/25 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="relative">
              <UserIcon className="w-4.5 h-4.5 absolute left-4 top-1/2 -translate-y-1/2 text-mist-500" />
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls}
                required
                aria-label="Full name"
              />
            </div>

            {/* Persona */}
            <div>
              <p className="text-xs font-semibold text-mist-500 uppercase tracking-widest mb-2.5">Your life stage</p>
              <div className="grid grid-cols-2 gap-2.5">
                {PERSONA_OPTIONS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPersona(p.id)}
                    className={`text-left p-3.5 rounded-2xl border transition-all duration-300 ${
                      persona === p.id
                        ? 'bg-white/10 border-emerald-400/50 scale-[1.02]'
                        : 'bg-white/3 border-white/8 hover:border-white/20'
                    }`}
                    aria-pressed={persona === p.id}
                  >
                    <p.icon className={`w-4.5 h-4.5 mb-1.5 ${p.color}`} />
                    <p className="text-xs font-bold">{p.label}</p>
                    <p className="text-[10px] text-mist-500 mt-0.5">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Income */}
            <div className="relative">
              <IndianRupee className="w-4.5 h-4.5 absolute left-4 top-1/2 -translate-y-1/2 text-mist-500" />
              <input
                type="number"
                placeholder="Monthly income (₹)"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                className={inputCls}
                min={0}
                required
                aria-label="Monthly income in rupees"
              />
            </div>

            {error && (
              <p className="flex items-center gap-2 text-sm text-rose-300 bg-rose-500/10 border border-rose-400/20 rounded-xl px-4 py-3" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="btn-accent w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {busy ? (
                <span className="w-4 h-4 rounded-full border-2 border-ink-950 border-t-transparent animate-spin" />
              ) : (
                <>
                  Finish setup <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={logout}
              className="w-full py-2.5 text-sm text-mist-500 hover:text-mist-100 flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Use a different account
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingScreen;
