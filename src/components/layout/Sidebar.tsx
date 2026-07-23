import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Bot,
  Target,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  Building2,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'transactions'
  | 'budget'
  | 'analytics'
  | 'aicoach'
  | 'vision'
  | 'goals'
  | 'business';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'budget', label: 'Budget Planner', icon: Sliders },
    { id: 'analytics', label: 'Analytics & Charts', icon: PieChart },
    { id: 'aicoach', label: 'AI Financial Coach', icon: Bot, badge: 'Gemini AI' },
    { id: 'vision', label: 'AI Vision Board', icon: ImageIcon, badge: 'Image' },
    { id: 'goals', label: 'Savings Goals', icon: Target },
    { id: 'business', label: 'Business & Runway', icon: Building2, badge: 'B2B' },
  ];

  return (
    <aside className="w-full md:w-64 shrink-0">
      <div className="sticky top-20 rounded-3xl bg-white/70 backdrop-blur-xl border border-emerald-500/15 p-3 shadow-lg shadow-emerald-950/5 space-y-1">
        <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center justify-between">
          <span>Main Navigation</span>
          <Sparkles className="w-3 h-3 text-emerald-500" />
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as ActiveTab)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 translate-x-1'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-emerald-50/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Hackathon Tip Banner */}
        <div className="mt-4 p-3 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white border border-emerald-500/20 text-slate-700">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Hackathon Highlight
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Savorah dynamically reconfigures widgets based on profile (Student, Professional, Family, Senior).
          </p>
        </div>
      </div>
    </aside>
  );
};
