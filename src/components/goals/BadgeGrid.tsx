import React, { useState } from 'react';
import { SavingsGoal } from '../../types';
import { achievementService } from '../../services/achievementService';
import { Award, Sparkles, CheckCircle2, Lock } from 'lucide-react';

interface BadgeGridProps {
  goals: SavingsGoal[];
}

export const BadgeGrid: React.FC<BadgeGridProps> = ({ goals }) => {
  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const badges = achievementService.getBadges(goals, totalSaved);
  const [selectedBadge, setSelectedBadge] = useState<any | null>(null);

  return (
    <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
            <Award className="w-4 h-4" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Achievement Badges & Savings Streaks
          </h3>
        </div>

        <span className="text-xs font-bold text-slate-500">
          {badges.filter((b) => b.unlocked).length}/{badges.length} Unlocked
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {badges.map((badge) => (
          <button
            key={badge.id}
            onClick={() => setSelectedBadge(badge)}
            className={`p-3.5 rounded-2xl border transition-all text-left space-y-2 relative overflow-hidden group ${
              badge.unlocked
                ? 'bg-gradient-to-br from-amber-50/80 to-emerald-50/80 border-amber-300/80 hover:border-amber-400 hover:shadow-md'
                : 'bg-slate-50/60 border-slate-200/80 grayscale opacity-75 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{badge.icon}</span>
              {badge.unlocked ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              )}
            </div>

            <div>
              <h4 className="text-xs font-extrabold text-slate-900 line-clamp-1">{badge.title}</h4>
              <p className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-2">
                {badge.description}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  badge.unlocked ? 'bg-amber-500' : 'bg-slate-400'
                }`}
                style={{ width: `${badge.progress}%` }}
              />
            </div>
          </button>
        ))}
      </div>

      {/* Badge Modal Detail */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-4xl mx-auto shadow-md animate-bounce">
              {selectedBadge.icon}
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">{selectedBadge.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{selectedBadge.description}</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 text-xs font-bold text-slate-700">
              {selectedBadge.unlocked ? (
                <span className="text-emerald-700 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Unlocked on {selectedBadge.unlockedAt || 'Today'}
                </span>
              ) : (
                <span className="text-amber-800">Progress: {selectedBadge.progress}% to unlock</span>
              )}
            </div>

            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-xs shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
