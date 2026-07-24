import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { UserPersona } from '../../types';
import {
  X,
  User as UserIcon,
  IndianRupee,
  GraduationCap,
  Briefcase,
  Users,
  HeartHandshake,
  LogOut,
  RefreshCw,
  Save,
  CheckCircle2,
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  { label: 'Student', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex&backgroundColor=b6e3f4,c0aede' },
  { label: 'Executive', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4,c0aede' },
  { label: 'Family', url: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=Miller&backgroundColor=b6e3f4,c0aede' },
  { label: 'Senior', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=Robert&backgroundColor=b6e3f4,c0aede' },
  { label: 'Creative', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Aria&backgroundColor=b6e3f4,c0aede' },
  { label: 'Cyber Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sparky&backgroundColor=b6e3f4,c0aede' },
  { label: 'Gamer', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo&backgroundColor=ffd5dc,ffdfbf' },
  { label: 'Hero', url: 'https://api.dicebear.com/7.x/personas/svg?seed=Felix&backgroundColor=b6e3f4,c0aede' },
  { label: 'Fun Emoji', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Joy&backgroundColor=ffd5dc,ffdfbf' },
  { label: 'Superstar', url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Champ&backgroundColor=b6e3f4,c0aede' },
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile, logout, switchPersonaQuick } = useAuth();
  const { resetToDemoData } = useFinance();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(currentUser?.name || '');
  const [monthlyIncome, setMonthlyIncome] = useState(currentUser?.monthlyIncome?.toString() || '0');
  const [persona, setPersona] = useState<UserPersona>(currentUser?.persona || 'student');
  const [avatar, setAvatar] = useState<string>(currentUser?.avatar || '');
  const [isDragging, setIsDragging] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setMonthlyIncome(currentUser.monthlyIncome.toString());
      setPersona(currentUser.persona);
      setAvatar(currentUser.avatar || '');
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const processFile = (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setAvatar(result);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      monthlyIncome: Number(monthlyIncome) || currentUser.monthlyIncome,
      persona,
      avatar,
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
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-500/20 shadow-2xl p-6 md:p-8 custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header & Avatar Upload Area */}
        <div className="flex flex-col sm:flex-row items-center gap-5 mb-6 pb-6 border-b border-slate-200/80">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative group cursor-pointer w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
              isDragging
                ? 'border-emerald-500 ring-4 ring-emerald-500/30 scale-105'
                : 'border-emerald-500/30 hover:border-emerald-500 shadow-md'
            }`}
            title="Click or drag image to change profile photo"
          >
            <img
              src={avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex&backgroundColor=b6e3f4,c0aede'}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-1 text-center">
              <Camera className="w-6 h-6 mb-1 text-emerald-300" />
              <span className="text-[10px] font-bold">Change Photo</span>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl font-bold text-slate-900">{name || currentUser.name}</h3>
            <p className="text-xs text-slate-500">{currentUser.email}</p>
            
            {/* Quick Upload Buttons */}
            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs border border-emerald-200 flex items-center gap-1.5 transition-all"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                Upload Photo
              </button>

              {avatar && avatar !== 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex&backgroundColor=b6e3f4,c0aede' && (
                <button
                  type="button"
                  onClick={() => setAvatar('https://api.dicebear.com/7.x/adventurer/svg?seed=Alex&backgroundColor=b6e3f4,c0aede')}
                  className="py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-xs flex items-center gap-1 transition-all"
                  title="Reset avatar to default"
                >
                  <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {uploadError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {uploadError}
          </div>
        )}

        {/* Preset Avatars Bar */}
        <div className="mb-6 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Choose an Animated Avatar
            </span>
            <span className="text-[10px] text-slate-400 font-medium">10 Characters</span>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-5 gap-2.5">
            {PRESET_AVATARS.map((item, idx) => {
              const isSelected = avatar === item.url;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(item.url)}
                  className={`group relative flex flex-col items-center p-1.5 rounded-2xl border transition-all duration-200 ${
                    isSelected
                      ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm scale-105'
                      : 'bg-white border-slate-200/90 hover:border-emerald-300 hover:bg-emerald-50/30'
                  }`}
                  title={item.label}
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-emerald-100/50 flex-shrink-0">
                    <img
                      src={item.url}
                      alt={item.label}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <span className={`mt-1 text-[9px] font-bold truncate max-w-full ${
                    isSelected ? 'text-emerald-700' : 'text-slate-600'
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {savedSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Profile and picture updated successfully!
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
              Monthly Base Income (₹)
            </label>
            <div className="relative">
              <IndianRupee className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
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

