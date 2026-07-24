import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types';
import { GoalSummaryCards } from './GoalSummaryCards';
import { GoalCard } from './GoalCard';
import { AIRecommendationPanel } from './AIRecommendationPanel';
import { GoalSimulator } from './GoalSimulator';
import { GoalTimeline } from './GoalTimeline';
import { BadgeGrid } from './BadgeGrid';
import { ContributionCalendar } from './ContributionCalendar';
import { InvestmentAllocationChart } from './InvestmentAllocationChart';
import { InvestmentPerformanceChart } from './InvestmentPerformanceChart';
import { WhatIfCalculator } from './WhatIfCalculator';
import { QuickContributionModal } from './QuickContributionModal';
import { GoalDrawer } from './GoalDrawer';
import { CreateGoalModal } from './CreateGoalModal';
import { Plus, Target, Sparkles, TrendingUp, Layers } from 'lucide-react';

export const SavingsGoalsView: React.FC = () => {
  const { goals, addGoal, contributeToGoal, deleteGoal } = useFinance();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [quickAddGoal, setQuickAddGoal] = useState<SavingsGoal | null>(null);
  const [selectedDrawerGoal, setSelectedDrawerGoal] = useState<SavingsGoal | null>(null);

  const handleApplyRecommendation = (goalId: string, extraMonthly: number) => {
    // Contribute extra deposit or update rate
    contributeToGoal(goalId, extraMonthly);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
              Smart Wealth Workspace
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              AI Adaptive Planning
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Investment & Goals Planning Hub
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Create, simulate, monitor, and achieve your long-term financial targets with AI predictions.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create New Financial Goal
        </button>
      </div>

      {/* 2. Top KPI Summary Cards */}
      <GoalSummaryCards goals={goals} />

      {/* 3. AI Financial Planner Recommendation Panel */}
      <AIRecommendationPanel goals={goals} onApplyRecommendation={handleApplyRecommendation} />

      {/* 4. Active Financial Goals Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-600" />
            Active Financial Goals ({goals.length})
          </h3>
          <span className="text-xs text-slate-500 font-semibold">Click cards for deep AI drawer insights</span>
        </div>

        {goals.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mx-auto">
              🎯
            </div>
            <h4 className="text-base font-extrabold text-slate-900">Start Your First Financial Goal</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Set savings targets for a Home, Vacation, Education, or Emergency Fund with AI guidance.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs"
            >
              Create Goal Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {goals.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                onOpenQuickAdd={(goal) => setQuickAddGoal(goal)}
                onOpenDetails={(goal) => setSelectedDrawerGoal(goal)}
                onDelete={(id) => deleteGoal(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 5. Smart Goal Simulator & Growth Engine */}
      <GoalSimulator />

      {/* 6. Performance & Allocation Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <InvestmentPerformanceChart goals={goals} />
        </div>
        <div className="lg:col-span-5">
          <InvestmentAllocationChart goals={goals} />
        </div>
      </div>

      {/* 7. AI What-If Calculator */}
      <WhatIfCalculator goals={goals} />

      {/* 8. Goal Timeline & Milestones */}
      <GoalTimeline goals={goals} />

      {/* 9. Contribution Calendar & Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <ContributionCalendar goals={goals} />
        </div>
        <div className="lg:col-span-5">
          <BadgeGrid goals={goals} />
        </div>
      </div>

      {/* Modals & Drawers */}
      {isCreateOpen && (
        <CreateGoalModal onClose={() => setIsCreateOpen(false)} onSubmit={(g) => addGoal(g)} />
      )}

      {quickAddGoal && (
        <QuickContributionModal
          goal={quickAddGoal}
          onClose={() => setQuickAddGoal(null)}
          onConfirm={(id, amt) => contributeToGoal(id, amt)}
        />
      )}

      {selectedDrawerGoal && (
        <GoalDrawer goal={selectedDrawerGoal} onClose={() => setSelectedDrawerGoal(null)} />
      )}
    </div>
  );
};
