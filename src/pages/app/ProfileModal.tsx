import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, IndianRupee, Check, GraduationCap, Briefcase, Users, Heart, Instagram, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserPersona } from '../../types';
import { SITE } from '../../config/site';

const PERSONAS: Array<{ id: UserPersona; label: string; icon: React.FC<{ className?: string }> }> = [
  { id: 'student', label: 'Student', icon: GraduationCap },
  { id: 'professional', label: 'Professional', icon: Briefcase },
  { id: 'family', label: 'Family', icon: Users },
  { id: 'senior', label: 'Senior', icon: Heart },
];

const ProfileModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile } = useAuth();

  const [name, setName] = useState('');
  const [income, setIncome] = useState('');
  const [persona, setPersona] = useState<UserPersona>('professional');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      setName(currentUser.name);
      setIncome(String(currentUser.monthlyIncome));
      setPersona(currentUser.persona);
      setSaved(false);
      setError(null);
    }
  }, [isOpen, currentUser]);

  const handleSave = async () => {
    setBusy(true);
    setError(null);
    try {
      await updateProfile({
        name: name.trim() || currentUser?.name,
        monthlyIncome: Number(income) || currentUser?.monthlyIncome,
        persona,
      });
      setSaved(true);
      setTimeout(onClose, 700);
    } catch (e: any) {
      setError(e?.message || 'Could not save profile.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md glass-strong card-ring rounded-3xl p-7 bg-ink-900 relative"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Profile and settings"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-9 h-9 rounded-xl glass hover:bg-white/10 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-display text-xl font-semibold mb-6">Profile & settings</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-mist-500 uppercase tracking-widest block mb-2">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-emerald-400/60"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-mist-500 uppercase tracking-widest block mb-2">
                  Monthly income (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-mist-500" />
                  <input
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-emerald-400/60"
                    min={0}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-mist-500 uppercase tracking-widest block mb-2">
                  Life stage
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PERSONAS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPersona(p.id)}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border text-[10px] font-semibold transition-all ${
                        persona === p.id
                          ? 'bg-white/10 border-emerald-400/50'
                          : 'bg-white/3 border-white/8 hover:border-white/20 text-mist-500'
                      }`}
                      aria-pressed={persona === p.id}
                    >
                      <p.icon className="w-4.5 h-4.5" />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-rose-300">{error}</p>}

              <button
                onClick={handleSave}
                disabled={busy}
                className="btn-accent w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4" /> Saved
                  </>
                ) : busy ? (
                  <span className="w-4 h-4 rounded-full border-2 border-ink-950 border-t-transparent animate-spin" />
                ) : (
                  'Save changes'
                )}
              </button>

              <div className="pt-4 mt-1 border-t hairline">
                <p className="text-xs font-semibold text-mist-500 uppercase tracking-widest mb-3">Help & community</p>
                <div className="flex items-center gap-2.5">
                  <a
                    href={SITE.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl glass hover:bg-white/8 text-sm font-semibold text-mist-300 transition-colors"
                  >
                    <Instagram className="w-4 h-4" /> Instagram
                  </a>
                  <a
                    href={`mailto:${SITE.supportEmail}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl glass hover:bg-white/8 text-sm font-semibold text-mist-300 transition-colors"
                  >
                    <Mail className="w-4 h-4" /> Support
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;
