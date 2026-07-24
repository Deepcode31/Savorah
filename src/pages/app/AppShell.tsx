import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route, NavLink, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, ArrowLeftRight, PieChart, Target, LineChart, Sparkles,
  Bell, Plus, LogOut, Settings, X, CheckCheck, Info,
  AlertTriangle, CheckCircle2, ReceiptText, ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { Logo } from '../../components/brand/Logo';
import { ThemeToggle } from '../../components/brand/ThemeToggle';
import { SITE } from '../../config/site';
import { AddTransactionHub } from '../../components/transactions/AddTransactionHub';
import AuthScreen from './AuthScreen';
import OnboardingScreen from './OnboardingScreen';
import ProfileModal from './ProfileModal';
import DashboardView from './views/DashboardView';
import TransactionsView from './views/TransactionsView';
import BudgetsView from './views/BudgetsView';
import GoalsView from './views/GoalsView';
import AnalyticsView from './views/AnalyticsView';
import CoachView from './views/CoachView';

const NAV_ITEMS = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/transactions', label: 'Transactions', icon: ArrowLeftRight, end: false },
  { to: '/app/budgets', label: 'Budgets', icon: PieChart, end: false },
  { to: '/app/goals', label: 'Goals', icon: Target, end: false },
  { to: '/app/analytics', label: 'Analytics', icon: LineChart, end: false },
  { to: '/app/coach', label: 'AI Coach', icon: Sparkles, end: false },
];

const MOBILE_NAV = NAV_ITEMS.filter((n) => n.label !== 'Analytics');

const NOTIF_ICON: Record<string, React.FC<{ className?: string }>> = {
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle2,
  bill: ReceiptText,
};

/* ---------------- Notifications panel ---------------- */

const NotificationsPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { notifications, markNotificationRead, clearAllNotifications } = useFinance();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="absolute right-0 top-12 w-[22rem] max-w-[calc(100vw-2rem)] glass-strong card-ring rounded-2xl overflow-hidden z-50"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b hairline">
        <p className="font-semibold text-sm">Notifications</p>
        {notifications.length > 0 && (
          <button
            onClick={() => clearAllNotifications()}
            className="text-xs text-mist-500 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Clear all
          </button>
        )}
      </div>
      <div className="max-h-96 overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <p className="text-sm text-mist-500 text-center py-10">All caught up.</p>
        ) : (
          notifications.map((n) => {
            const Icon = NOTIF_ICON[n.type] || Info;
            return (
              <button
                key={n.id}
                onClick={() => !n.read && markNotificationRead(n.id)}
                className={`w-full text-left px-5 py-3.5 flex gap-3 border-b hairline last:border-0 transition-colors hover:bg-white/4 ${
                  n.read ? 'opacity-50' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    n.type === 'warning'
                      ? 'bg-amber-400/15 text-amber-300'
                      : n.type === 'success'
                        ? 'bg-emerald-400/15 text-emerald-300'
                        : 'bg-white/8 text-mist-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{n.title}</p>
                  <p className="text-xs text-mist-500 leading-snug mt-0.5">{n.message}</p>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-2 ml-auto" />}
              </button>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

/* ---------------- User menu ---------------- */

const UserMenu: React.FC<{ onOpenProfile: () => void }> = ({ onOpenProfile }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-2xl glass hover:bg-white/8 transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="w-8 h-8 rounded-xl btn-accent flex items-center justify-center text-xs font-bold">
          {currentUser?.name?.[0]?.toUpperCase() || 'S'}
        </div>
        <span className="hidden sm:block text-sm font-semibold max-w-[8rem] truncate">
          {currentUser?.name}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-mist-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-12 w-56 glass-strong card-ring rounded-2xl overflow-hidden z-50 p-1.5"
            role="menu"
          >
            <div className="px-3.5 py-3 border-b hairline mb-1.5">
              <p className="text-sm font-semibold truncate">{currentUser?.name}</p>
              <p className="text-xs text-mist-500 truncate">{currentUser?.email}</p>
            </div>
            <button
              onClick={() => {
                setOpen(false);
                onOpenProfile();
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm text-mist-300 hover:text-white hover:bg-white/6 transition-colors"
              role="menuitem"
            >
              <Settings className="w-4 h-4" /> Profile & settings
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm text-rose-300 hover:bg-rose-500/10 transition-colors"
              role="menuitem"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ---------------- Shell ---------------- */

const AppShell: React.FC = () => {
  const { currentUser, authLoading } = useAuth();
  const { notifications } = useFinance();
  const location = useLocation();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [hubOpen, setHubOpen] = useState(false);

  useEffect(() => {
    document.title = 'Savorah — Dashboard';
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!currentUser) return <AuthScreen />;
  if (!currentUser.onboardingComplete) return <OnboardingScreen />;

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div
      data-persona={currentUser.persona}
      className="min-h-screen bg-ink-950 text-mist-100 flex relative"
    >
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-64 left-1/3 w-[50rem] h-[50rem] rounded-full blur-[160px] opacity-40" style={{ background: 'var(--accent-soft)' }} />
        <div className="absolute bottom-0 -right-40 w-[36rem] h-[36rem] rounded-full bg-indigo-500/6 blur-[140px]" />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 sticky top-0 h-screen border-r hairline px-4 py-6 z-20">
        <NavLink to="/" className="flex items-center px-3 mb-10">
          <Logo size={34} wordmarkClassName="text-lg" />
        </NavLink>

        <nav className="flex flex-col gap-1" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {({ isActive }) => (
                <div
                  className={`relative flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[var(--accent)]'
                      : 'text-mist-500 hover:text-mist-100 hover:bg-white/4'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-2xl glass"
                      style={{ borderColor: 'var(--accent-soft)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <item.icon className="w-[18px] h-[18px] relative" />
                  <span className="relative">{item.label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto">
          <button
            onClick={() => setHubOpen(true)}
            className="btn-accent w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add transaction
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col relative z-10">
        {/* Top bar */}
        <header className="sticky top-0 z-30 px-4 md:px-8 py-4 backdrop-blur-xl bg-ink-950/70 border-b hairline flex items-center justify-between gap-3">
          <NavLink to="/" className="lg:hidden flex items-center">
            <Logo size={30} wordmarkClassName="text-base" />
          </NavLink>

          <p className="hidden lg:block text-sm text-mist-500">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <div className="relative">
              <button
                onClick={() => setNotifOpen((o) => !o)}
                className="relative w-10 h-10 rounded-2xl glass hover:bg-white/8 flex items-center justify-center transition-colors"
                aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
              >
                <Bell className="w-4.5 h-4.5 text-mist-300" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 rounded-full btn-accent text-[10px] font-bold flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && <NotificationsPanel onClose={() => setNotifOpen(false)} />}
              </AnimatePresence>
            </div>
            <UserMenu onOpenProfile={() => setProfileOpen(true)} />
          </div>
        </header>

        {/* Routed content with page transitions */}
        <main className="flex-1 px-4 md:px-8 py-6 md:py-8 pb-32 lg:pb-10 max-w-6xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <Routes location={location}>
                <Route index element={<DashboardView onOpenAdd={() => setHubOpen(true)} />} />
                <Route path="transactions" element={<TransactionsView />} />
                <Route path="budgets" element={<BudgetsView />} />
                <Route path="goals" element={<GoalsView />} />
                <Route path="analytics" element={<AnalyticsView />} />
                <Route path="coach" element={<CoachView />} />
                <Route path="*" element={<Navigate to="/app" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-2"
        aria-label="Mobile"
      >
        <div className="glass-strong card-ring rounded-3xl flex items-center justify-around px-2 py-2.5">
          {MOBILE_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="flex-1">
              {({ isActive }) => (
                <div className="flex flex-col items-center gap-1 py-1">
                  <item.icon
                    className="w-5 h-5 transition-colors"
                    style={{ color: isActive ? 'var(--accent)' : '#8b968f' }}
                  />
                  <span
                    className="text-[9px] font-semibold transition-colors"
                    style={{ color: isActive ? 'var(--accent)' : '#8b968f' }}
                  >
                    {item.label}
                  </span>
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Mobile FAB */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setHubOpen(true)}
        className="lg:hidden fixed bottom-24 right-4 z-40 w-14 h-14 rounded-2xl btn-accent flex items-center justify-center"
        aria-label="Add transaction"
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </motion.button>

      {/* Modals */}
      {hubOpen && <AddTransactionHub isOpen={hubOpen} onClose={() => setHubOpen(false)} />}
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
};

export default AppShell;
