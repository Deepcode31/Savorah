import React from 'react';
import { SavorahLogo } from '../common/SavorahLogo';
import {
  LayoutDashboard,
  Receipt,
  CalendarDays,
  TrendingUp,
  CreditCard,
  Target,
  Sparkles,
  BarChart3,
  Settings,
  HelpCircle,
  Headphones,
  LogOut,
  Building2,
  Bot,
  Zap,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'transactions'
  | 'budget'
  | 'analytics'
  | 'aicoach'
  | 'goals'
  | 'business';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const generalGroup = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'budget', label: 'Bill & Subscription', icon: CalendarDays },
    { id: 'goals', label: 'Investment & Goals', icon: TrendingUp },
    { id: 'business', label: 'Card & Business', icon: CreditCard },
  ];

  const toolsGroup = [
    { id: 'aicoach', label: 'AI Financial Coach', icon: Bot, badge: 'AI' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const otherGroup = [
    { id: 'settings', label: 'Setting', icon: Settings },
    { id: 'help', label: 'Help Center', icon: HelpCircle },
    { id: 'support', label: 'Support', icon: Headphones },
  ];

  return (
    <>
      {/* Mobile Touch Navigation */}
      <div className="block lg:hidden w-full shrink-0 mb-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1 touch-pan-x">
          {[...generalGroup, ...toolsGroup].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as ActiveTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                  isActive
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                    : 'bg-white/80 text-slate-700 border-slate-200/80 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Grouped Sidebar */}
      <aside className="hidden lg:block w-60 shrink-0">
        <div className="sticky top-24 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 p-4 shadow-sm space-y-6">
          {/* Logo Branding */}
          <div className="flex items-center gap-2.5 px-2 pb-2 border-b border-slate-100">
            <SavorahLogo className="w-8 h-8" showText={true} />
          </div>

          {/* General Section */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              General
            </div>
            {generalGroup.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id as ActiveTab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-700 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tools Section */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Tools
            </div>
            {toolsGroup.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id as ActiveTab)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-700 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Other Section */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Other
            </div>
            {otherGroup.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab('dashboard')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all"
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Upgrade to PRO CTA Box */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white border border-emerald-500/20 shadow-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-800">
              <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              <span>Upgrade to PRO</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Upgrade to pro plan + Get 1 month more free Savorah AI tools.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

