import { SavingsGoal } from '../types';

export interface BadgeItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0 to 100
}

export const achievementService = {
  getBadges(goals: SavingsGoal[], totalSaved: number): BadgeItem[] {
    const completedGoalsCount = goals.filter((g) => g.currentAmount >= g.targetAmount).length;
    const hasEmergencyFund = goals.some(
      (g) => g.title.toLowerCase().includes('emergency') && g.currentAmount >= g.targetAmount
    );

    return [
      {
        id: 'badge-1',
        icon: '🥉',
        title: 'First ₹10,000 Saved',
        description: 'Saved your first ₹10,000 across financial goals.',
        unlocked: totalSaved >= 10000,
        unlockedAt: totalSaved >= 10000 ? '2026-06-15' : undefined,
        progress: Math.min(100, Math.round((totalSaved / 10000) * 100)),
      },
      {
        id: 'badge-2',
        icon: '🥈',
        title: '3 Active Goals Created',
        description: 'Structured 3 concurrent financial targets.',
        unlocked: goals.length >= 3,
        unlockedAt: goals.length >= 3 ? '2026-07-01' : undefined,
        progress: Math.min(100, Math.round((goals.length / 3) * 100)),
      },
      {
        id: 'badge-3',
        icon: '🥇',
        title: 'Emergency Reserve Ready',
        description: 'Fully funded an Emergency Buffer goal.',
        unlocked: hasEmergencyFund || completedGoalsCount >= 1,
        unlockedAt: hasEmergencyFund ? '2026-05-01' : undefined,
        progress: hasEmergencyFund ? 100 : completedGoalsCount > 0 ? 100 : 60,
      },
      {
        id: 'badge-4',
        icon: '🏆',
        title: '₹1 Lakh Milestone',
        description: 'Crossed ₹1,000,000 total active investment & savings.',
        unlocked: totalSaved >= 100000,
        unlockedAt: totalSaved >= 100000 ? '2026-07-10' : undefined,
        progress: Math.min(100, Math.round((totalSaved / 100000) * 100)),
      },
      {
        id: 'badge-5',
        icon: '🎯',
        title: '100 Days Saving Streak',
        description: 'Maintained monthly SIP contributions for 3 consecutive cycles.',
        unlocked: true,
        unlockedAt: '2026-07-20',
        progress: 100,
      },
    ];
  },
};
