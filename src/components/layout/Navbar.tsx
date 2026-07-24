import React, { useState, useEffect, useRef } from 'react';
import { SavorahLogo } from '../common/SavorahLogo';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { UserPersona } from '../../types';
import {
  Wallet,
  Bell,
  Search,
  Clock,
  ChevronDown,
  Sparkles,
  User as UserIcon,
  GraduationCap,
  Briefcase,
  Users,
  HeartHandshake,
  PlusCircle,
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
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length || 2;
  const currentPersona = currentUser?.persona || 'professional';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setPersonaDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPersonaBadge = (persona: UserPersona) => {
    switch (persona) {
      case 'student':
        return { label: 'Student', icon: GraduationCap, color: 'text-emerald-700 bg-emerald-100 border-emerald-300' };
      case 'professional':
        return { label: 'Professional', icon: Briefcase, color: 'text-teal-700 bg-teal-100 border-teal-300' };
      case 'family':
        return { label: 'Family', icon: Users, color: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
      case 'senior':
        return { label: 'Senior Citizen', icon: HeartHandshake, color: 'text-teal-800 bg-teal-50 border-teal-200' };
    }
  };

  const badge = getPersonaBadge(currentPersona);
  const BadgeIcon = badge.icon;

  const formattedDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
        {/* Left Greeting */}
        <div className="flex items-center gap-3">
          <SavorahLogo className="w-9 h-9 lg:hidden shrink-0" />
          <div>
            <h1 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Hi, {currentUser?.name ? currentUser.name.split(' ')[0] : 'Ananya'} <span className="animate-bounce inline-block">👋</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium hidden sm:block">
              Track your all expense and transactions
            </p>
          </div>
        </div>

        {/* Center/Right Items */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Live Date Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-100/80 border border-slate-200 text-slate-600 text-[11px] font-bold">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>11:11 PM | {formattedDate} | IN</span>
          </div>

          {/* Search Bar */}
          <div className="relative hidden md:block w-48 lg:w-64">
            <input
              type="text"
              placeholder="Search expenses, transaction, cards"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3.5 pr-8 py-2 rounded-2xl bg-slate-100/70 border border-slate-200/80 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
          </div>

          {/* Persona Switcher Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
              className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-2xl border text-xs font-bold transition-all shadow-xs ${badge.color}`}
            >
              <BadgeIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{badge.label}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {personaDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white/95 backdrop-blur-xl border border-emerald-500/20 shadow-2xl p-2 z-50">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  Switch Financial Persona:
                </div>
                {(['student', 'professional', 'family', 'senior'] as UserPersona[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      switchPersonaQuick(p);
                      setPersonaDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                      currentPersona === p ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {p} Mode
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Add Button */}
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 py-2 px-3 sm:px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Add Expense</span>
          </button>

          {/* Notification Bell Badge */}
          <button
            onClick={onOpenProfileModal}
            className="relative p-2 rounded-2xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center border-2 border-white">
              {unreadCount}
            </span>
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={onOpenProfileModal}
            className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 hover:bg-emerald-50 border border-slate-200/80 transition-all"
          >
            <img
              src={currentUser?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Ananya&backgroundColor=b6e3f4'}
              alt={currentUser?.name || 'User'}
              className="w-8 h-8 rounded-xl object-cover"
            />
          </button>
        </div>
      </div>
    </header>
  );
};

