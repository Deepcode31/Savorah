import React, { useState } from 'react';
import { SavorahLogo } from '../common/SavorahLogo';
import { useAuth } from '../../context/AuthContext';
import { UserPersona } from '../../types';
import {
  ShieldCheck,
  Mail,
  Lock,
  User as UserIcon,
  IndianRupee,
  GraduationCap,
  Briefcase,
  Users,
  HeartHandshake,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  X,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setAuthModalOpen,
    authMode,
    setAuthMode,
    login,
    signup,
    loginWithGoogle,
    switchPersonaQuick,
    currentUser,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [persona, setPersona] = useState<UserPersona>('student');
  const [monthlyIncome, setMonthlyIncome] = useState('2500');
  const [error, setError] = useState('');

  if (!isAuthModalOpen && currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (authMode === 'login') {
      if (!email.trim()) {
        setError('Please enter your email address.');
        return;
      }
      login(email, password);
    } else {
      if (!name.trim() || !email.trim()) {
        setError('Please fill in all required fields.');
        return;
      }
      signup(name, email, persona, Number(monthlyIncome) || 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white/85 backdrop-blur-xl border border-emerald-500/20 shadow-2xl shadow-emerald-950/10 p-6 md:p-8">
        {/* Decorative ambient lighting */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />

        {currentUser && (
          <button
            onClick={() => setAuthModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 transition-all"
            aria-label="Close authentication modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs mb-3">
            <SavorahLogo className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome to <span className="text-emerald-700 font-extrabold">Savorah</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Track your money, so you can pretend you're in control.
          </p>
        </div>

        {/* One-Click Hackathon Demo Selector */}
        <div className="mb-6 p-3 rounded-2xl bg-emerald-50/80 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Instant Hackathon Demo Logins:
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => {
                switchPersonaQuick('student');
                setAuthModalOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-white/90 border border-emerald-500/15 hover:border-emerald-500/40 hover:bg-emerald-100/60 text-xs font-medium text-slate-700 transition-all"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              Student
            </button>
            <button
              type="button"
              onClick={() => {
                switchPersonaQuick('professional');
                setAuthModalOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-white/90 border border-emerald-500/15 hover:border-emerald-500/40 hover:bg-emerald-100/60 text-xs font-medium text-slate-700 transition-all"
            >
              <Briefcase className="w-3.5 h-3.5 text-teal-600" />
              Pro
            </button>
            <button
              type="button"
              onClick={() => {
                switchPersonaQuick('family');
                setAuthModalOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-white/90 border border-emerald-500/15 hover:border-emerald-500/40 hover:bg-emerald-100/60 text-xs font-medium text-slate-700 transition-all"
            >
              <Users className="w-3.5 h-3.5 text-blue-600" />
              Family
            </button>
            <button
              type="button"
              onClick={() => {
                switchPersonaQuick('senior');
                setAuthModalOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-white/90 border border-emerald-500/15 hover:border-emerald-500/40 hover:bg-emerald-100/60 text-xs font-medium text-slate-700 transition-all"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-purple-600" />
              Senior
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-100/80 p-1 mb-6 border border-slate-200/60">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setError('');
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              authMode === 'login'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setError('');
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              authMode === 'signup'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-medium flex items-center gap-2">
            <X className="w-4 h-4 shrink-0 text-rose-500" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Sarah Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/70 border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-800 placeholder-slate-400 transition-all"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/70 border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-800 placeholder-slate-400 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/70 border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-800 placeholder-slate-400 transition-all"
              />
            </div>
          </div>

          {authMode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Your Financial Profile (Adaptive Dashboard)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPersona('student')}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all ${
                      persona === 'student'
                        ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white/60 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Student</div>
                      <div className="text-[10px] text-slate-500 leading-tight">
                        Allowance, textbooks & habits
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPersona('professional')}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all ${
                      persona === 'professional'
                        ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white/60 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Professional</div>
                      <div className="text-[10px] text-slate-500 leading-tight">
                        Salary, investments & goals
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPersona('family')}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all ${
                      persona === 'family'
                        ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white/60 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Users className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Family</div>
                      <div className="text-[10px] text-slate-500 leading-tight">
                        Household bills & shared funds
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPersona('senior')}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all ${
                      persona === 'senior'
                        ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white/60 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <HeartHandshake className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Senior Citizen</div>
                      <div className="text-[10px] text-slate-500 leading-tight">
                        Fixed pension & essential care
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated Monthly Income (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/70 border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-800 transition-all"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all duration-200"
          >
            {authMode === 'login' ? 'Sign In to Dashboard' : 'Complete Setup & Launch Dashboard'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200/80" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white/90 text-slate-400 font-medium">Or continue with</span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={loginWithGoogle}
          className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold flex items-center justify-center gap-2.5 shadow-sm transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Google Single Sign-In
        </button>

        <p className="text-[11px] text-center text-slate-400 mt-4">
          By continuing, you agree to Savorah's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};
