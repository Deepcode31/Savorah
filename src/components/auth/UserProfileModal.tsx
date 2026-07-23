import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { UserPersona } from '../../types';
import {
  X,
  User as UserIcon,
  DollarSign,
  GraduationCap,
  Briefcase,
  Users,
  HeartHandshake,
  LogOut,
  RefreshCw,
  Save,
  CheckCircle2,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile, logout, switchPersonaQuick } = useAuth();
  const { resetToDemoData } = useFinance();

  const [name, setName] = useState(currentUser?.name || '');
  const [monthlyIncome, setMonthlyIncome] = useState(currentUser?.monthlyIncome?.toString() || '0');
  const [persona, setPersona] = useState<UserPersona>(currentUser?.persona || 'student');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setMonthlyIncome(currentUser.monthlyIncome.toString());
      setPersona(currentUser.persona);
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      monthlyIncome: Number(monthlyIncome) || currentUser.monthlyIncome,
      persona,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handlePersonaSwitch = (newPersona: UserPersona) => {
    setPersona(newPersona);
    switchPersonaQuick(newPersona);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white/90 backdrop-blur-xl border border-emerald-500/20 shadow-2xl p-6 md:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-200/80">
          <img
            src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/30 shadow-md"
          />
          <div>
            <h3 className="text-xl font-bold text-slate-900">{currentUser.name}</h3>
            <p className="text-xs text-slate-500">{currentUser.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 capitalize border border-emerald-200">
              {currentUser.persona} Profile
            </span>
          </div>
        </div>

        {savedSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Profile changes updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Account Display Name
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/80 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Monthly Base Income ($)
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/80 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Active Dashboard Persona
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handlePersonaSwitch('student')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 text-xs font-semibold transition-all ${
                  persona === 'student'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                Student
              </button>

              <button
                type="button"
                onClick={() => handlePersonaSwitch('professional')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 text-xs font-semibold transition-all ${
                  persona === 'professional'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <Briefcase className="w-4 h-4 text-teal-600" />
                Professional
              </button>

              <button
                type="button"
                onClick={() => handlePersonaSwitch('family')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 text-xs font-semibold transition-all ${
                  persona === 'family'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <Users className="w-4 h-4 text-blue-600" />
                Family
              </button>

              <button
                type="button"
                onClick={() => handlePersonaSwitch('senior')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 text-xs font-semibold transition-all ${
                  persona === 'senior'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <HeartHandshake className="w-4 h-4 text-purple-600" />
                Senior Citizen
              </button>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <button
              type="submit"
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20"
            >
              <Save className="w-4 h-4" />
              Save Profile Changes
            </button>

            <button
              type="button"
              onClick={resetToDemoData}
              className="w-full sm:w-auto py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              Reset Demo Data
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">Security & Access</span>
          <button
            type="button"
            onClick={() => {
              logout();
              onClose();
            }}
            className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-xs flex items-center gap-1.5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
