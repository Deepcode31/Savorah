import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { UserPersona } from '../../types';
import {
  Wallet,
  Bell,
  PlusCircle,
  GraduationCap,
  Briefcase,
  Users,
  HeartHandshake,
  ChevronDown,
  Sparkles,
  User as UserIcon,
  ShieldCheck,
} from 'lucide-react';

interface NavbarProps {
  onOpenAuthModal?: () => void;
  onOpenProfileModal?: () => void;
  onOpenAddExpense?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuthModal,
  onOpenProfileModal,
  onOpenAddExpense,
}) => {
  const { currentUser, switchPersonaQuick, setAuthModalOpen } = useAuth();
  const { notifications } = useFinance();

  const [personaDropdownOpen, setPersonaDropdownOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const currentPersona = currentUser?.persona || 'professional';

  const getPersonaBadge = (persona: UserPersona) => {
    switch (persona) {
      case 'student':
        return { label: 'Student', icon: GraduationCap, color: 'text-emerald-700 bg-emerald-100 border-emerald-300' };
      case 'professional':
        return { label: 'Professional', icon: Briefcase, color: 'text-teal-700 bg-teal-100 border-teal-300' };
      case 'family':
        return { label: 'Family', icon: Users, color: 'text-blue-700 bg-blue-100 border-blue-300' };
      case 'senior':
        return { label: 'Senior Citizen', icon: HeartHandshake, color: 'text-purple-700 bg-purple-100 border-purple-300' };
    }
  };

  const badge = getPersonaBadge(currentPersona);
  const BadgeIcon = badge.icon;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/75 border-b border-emerald-500/15 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Savorah
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                AI Budgeting
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-500 font-medium leading-none">
              Track your money, so you can pretend you're in control.
            </p>
          </div>
        </div>

        {/* Center: Persona Switcher Badge */}
        <div className="relative">
          <button
            onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
            className={`flex items-center gap-2 py-1.5 px-3 rounded-2xl border text-xs font-bold transition-all shadow-sm ${badge.color} hover:opacity-90`}
          >
            <BadgeIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{badge.label} Dashboard</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {personaDropdownOpen && (
            <div className="absolute right-0 sm:left-0 mt-2 w-56 rounded-2xl bg-white/95 backdrop-blur-xl border border-emerald-500/20 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                Switch Persona Dashboard:
              </div>

              <button
                onClick={() => {
                  switchPersonaQuick('student');
                  setPersonaDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  currentPersona === 'student' ? 'bg-emerald-50 text-emerald-900' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                Student Profile
              </button>

              <button
                onClick={() => {
                  switchPersonaQuick('professional');
                  setPersonaDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  currentPersona === 'professional' ? 'bg-emerald-50 text-emerald-900' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Briefcase className="w-4 h-4 text-teal-600" />
                Professional Profile
              </button>

              <button
                onClick={() => {
                  switchPersonaQuick('family');
                  setPersonaDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  currentPersona === 'family' ? 'bg-emerald-50 text-emerald-900' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4 text-blue-600" />
                Family Profile
              </button>

              <button
                onClick={() => {
                  switchPersonaQuick('senior');
                  setPersonaDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  currentPersona === 'senior' ? 'bg-emerald-50 text-emerald-900' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <HeartHandshake className="w-4 h-4 text-purple-600" />
                Senior Citizen Profile
              </button>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Add Expense Button */}
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 py-2 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Add Expense</span>
          </button>

          {/* Notifications Drawer Bell */}
          <button
            onClick={onOpenProfileModal}
            className="relative p-2.5 rounded-xl bg-white/80 border border-slate-200/80 hover:bg-slate-100/80 text-slate-600 transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Profile / Account Button */}
          {currentUser ? (
            <button
              onClick={onOpenProfileModal}
              className="flex items-center gap-2 p-1 rounded-2xl bg-white/80 border border-emerald-500/20 hover:border-emerald-500/40 transition-all shadow-sm"
            >
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                alt={currentUser.name}
                className="w-8 h-8 rounded-xl object-cover"
              />
              <span className="hidden lg:inline text-xs font-bold text-slate-800 pr-1.5">
                {currentUser.name.split(' ')[0]}
              </span>
            </button>
          ) : (
            <button
              onClick={() => onOpenAuthModal ? onOpenAuthModal() : setAuthModalOpen(true)}
              className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-sm hover:bg-slate-800 transition-all"
            >
              <UserIcon className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
