import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight, Mail, Sparkles, ArrowLeft, AlertCircle, ShieldCheck, RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/brand/Logo';
import { ThemeToggle } from '../../components/brand/ThemeToggle';
import { GoogleButton } from '../../components/auth/GoogleButton';
import { SITE } from '../../config/site';

const inputCls =
  'w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-mist-100 placeholder:text-mist-500 focus:outline-none focus:border-emerald-400/60 focus:bg-white/8 transition-all';

const AuthScreen: React.FC = () => {
  const { requestOtp, verifyOtp, loginWithGoogle, authMode, setAuthMode } = useAuth();

  const [step, setStep] = useState<'form' | 'code'>('form');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const isSignup = authMode === 'signup';
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  useEffect(() => {
    if (step === 'code') codeInputRef.current?.focus();
  }, [step]);

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      const res = await requestOtp({ email: email.trim() });
      setStep('code');
      setResendIn(30);
      setNotice(
        res.emailed
          ? `We sent a 6-digit code to ${email.trim()}.`
          : `We generated a login code for ${email.trim()}. Check your email, or ask your admin if it didn’t arrive.`
      );
    } catch (err: any) {
      setError(err?.message || 'Could not send the code. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const submitCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await verifyOtp(email.trim(), code.trim());
    } catch (err: any) {
      setError(err?.message || 'Invalid code. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async (credential: string) => {
    setError(null);
    setBusy(true);
    try {
      await loginWithGoogle(credential);
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 text-mist-100 flex items-stretch relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-[44rem] h-[44rem] rounded-full bg-emerald-600/12 blur-[140px] animate-aurora" aria-hidden />
      <div className="absolute bottom-0 right-0 w-[36rem] h-[36rem] rounded-full bg-indigo-500/10 blur-[130px] animate-aurora" style={{ animationDelay: '-7s' }} aria-hidden />
      <div className="absolute inset-0 grid-fade opacity-60" aria-hidden />

      <div className="absolute top-5 right-5 z-10">
        <ThemeToggle />
      </div>

      {/* Brand panel (desktop) */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] p-12 relative">
        <Link to="/" aria-label={`${SITE.name} home`}>
          <Logo size={40} wordmarkClassName="text-xl" />
        </Link>

        <div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-4xl xl:text-5xl font-semibold leading-[1.08] tracking-tight"
          >
            Every rupee,
            <br />
            <span className="accent-text">working for you.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8 }}
            className="text-mist-500 mt-5 max-w-sm leading-relaxed"
          >
            AI-powered budgets, effortless transaction capture, and a coach that actually knows your finances. Free, forever.
          </motion.p>
        </div>

        <div className="flex items-center gap-3 text-sm text-mist-500">
          <Sparkles className="w-4 h-4 text-emerald-300" />
          Adaptive to students, professionals, families & seniors.
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <Link to="/" className="lg:hidden flex items-center gap-2 text-sm text-mist-500 hover:text-white mb-8 w-fit">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <div className="glass-strong card-ring rounded-3xl p-8">
            <AnimatePresence mode="wait">
              {step === 'form' ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="font-display text-2xl font-semibold">
                    {isSignup ? 'Create your free account' : 'Welcome back'}
                  </h2>
                  <p className="text-sm text-mist-500 mt-1.5 mb-7">
                    {isSignup
                      ? 'Sign in with Google or email — we’ll help you set up your profile next.'
                      : "Enter your email and we'll send a login code."}
                  </p>

                  <div className="mb-5">
                    <GoogleButton onCredential={handleGoogle} onError={(m) => setError(m)} />
                  </div>

                  <div className="flex items-center gap-3 mb-5">
                    <span className="flex-1 h-px bg-white/8" />
                    <span className="text-[11px] text-mist-500 uppercase tracking-widest">or with email</span>
                    <span className="flex-1 h-px bg-white/8" />
                  </div>

                  <form onSubmit={sendCode} className="space-y-4">
                    <div className="relative">
                      <Mail className="w-4.5 h-4.5 absolute left-4 top-1/2 -translate-y-1/2 text-mist-500" />
                      <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputCls}
                        required
                        aria-label="Email address"
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
                          Send login code <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <p className="text-center text-sm text-mist-500 mt-6">
                    {isSignup ? 'Already have an account?' : 'New to Savorah?'}{' '}
                    <button
                      onClick={() => {
                        setError(null);
                        setAuthMode(isSignup ? 'login' : 'signup');
                      }}
                      className="text-emerald-300 font-semibold hover:underline"
                    >
                      {isSignup ? 'Sign in' : 'Create one free'}
                    </button>
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="code"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.25 }}
                >
                  <button
                    onClick={() => {
                      setStep('form');
                      setCode('');
                      setError(null);
                      setNotice(null);
                    }}
                    className="flex items-center gap-1.5 text-sm text-mist-500 hover:text-white mb-6 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Change email
                  </button>

                  <div className="w-12 h-12 rounded-2xl btn-accent flex items-center justify-center mb-5">
                    <ShieldCheck className="w-5.5 h-5.5" />
                  </div>
                  <h2 className="font-display text-2xl font-semibold">Enter your code</h2>
                  {notice && <p className="text-sm text-mist-500 mt-1.5 mb-2">{notice}</p>}

                  <form onSubmit={submitCode} className="space-y-4 mt-5">
                    <input
                      ref={codeInputRef}
                      inputMode="numeric"
                      pattern="\d{6}"
                      maxLength={6}
                      placeholder="••••••"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full text-center tracking-[0.6em] text-2xl font-bold py-4 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:border-emerald-400/60"
                      aria-label="6-digit login code"
                    />

                    {error && (
                      <p className="flex items-center gap-2 text-sm text-rose-300 bg-rose-500/10 border border-rose-400/20 rounded-xl px-4 py-3" role="alert">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={busy || code.length !== 6}
                      className="btn-accent w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {busy ? (
                        <span className="w-4 h-4 rounded-full border-2 border-ink-950 border-t-transparent animate-spin" />
                      ) : (
                        <>
                          Verify & continue <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <button
                    onClick={() => sendCode()}
                    disabled={resendIn > 0 || busy}
                    className="w-full mt-4 py-3 rounded-2xl glass hover:bg-white/8 text-sm font-semibold text-mist-300 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="text-center text-xs text-mist-500 mt-6">
            Need help?{' '}
            <a href={`mailto:${SITE.supportEmail}`} className="text-emerald-300 hover:underline">
              {SITE.supportEmail}
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthScreen;
