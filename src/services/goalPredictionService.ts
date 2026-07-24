import { SavingsGoal } from '../types';

export interface CompoundCalculationResult {
  futureValue: number;
  totalInvested: number;
  totalGrowth: number;
  monthsRemaining: number;
  estimatedCompletionDate: string;
}

export const goalPredictionService = {
  /**
   * Calculates compound growth for monthly contributions
   */
  calculateFutureValue(
    initialAmount: number,
    monthlyDeposit: number,
    annualReturnRate: number,
    annualInflationRate: number,
    years: number
  ): CompoundCalculationResult {
    const months = Math.max(1, years * 12);
    // Real rate adjusted for inflation approx (r_real = r - i)
    const netRate = Math.max(0.1, annualReturnRate - annualInflationRate);
    const monthlyRate = netRate / 100 / 12;

    let balance = initialAmount;
    let totalInvested = initialAmount;

    for (let i = 0; i < months; i++) {
      balance = (balance + monthlyDeposit) * (1 + monthlyRate);
      totalInvested += monthlyDeposit;
    }

    const futureValue = Math.round(balance);
    const totalGrowth = Math.max(0, futureValue - totalInvested);

    // Completion date projection
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + months);
    const estimatedCompletionDate = targetDate.toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric',
    });

    return {
      futureValue,
      totalInvested,
      totalGrowth,
      monthsRemaining: months,
      estimatedCompletionDate,
    };
  },

  /**
   * Calculates months required to reach target
   */
  calculateMonthsToGoal(
    currentAmount: number,
    targetAmount: number,
    monthlyDeposit: number,
    annualReturnRate: number = 8
  ): number {
    if (currentAmount >= targetAmount) return 0;
    if (monthlyDeposit <= 0) return 999;

    const monthlyRate = Math.max(0.001, annualReturnRate / 100 / 12);
    let balance = currentAmount;
    let months = 0;

    while (balance < targetAmount && months < 600) {
      balance = (balance + monthlyDeposit) * (1 + monthlyRate);
      months++;
    }

    return months;
  },

  /**
   * Calculates required monthly contribution to reach target by deadline
   */
  calculateRequiredMonthlyContribution(
    currentAmount: number,
    targetAmount: number,
    deadlineStr: string,
    annualReturnRate: number = 8
  ): number {
    const remaining = Math.max(0, targetAmount - currentAmount);
    if (remaining === 0) return 0;

    const targetDate = new Date(deadlineStr);
    const now = new Date();
    let months = (targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth());
    months = Math.max(1, months);

    const monthlyRate = annualReturnRate / 100 / 12;
    if (monthlyRate === 0) {
      return Math.ceil(remaining / months);
    }

    // Formula for Annuity deposit: PMT = (FV - PV*(1+r)^n) / [((1+r)^n - 1)/r]
    const pmt =
      (remaining * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.max(500, Math.ceil(pmt));
  },

  /**
   * Generates performance chart timeline points
   */
  generatePerformanceSeries(period: '1M' | '3M' | '6M' | '1Y' | 'ALL', totalSaved: number) {
    const pointsCount = period === '1M' ? 4 : period === '3M' ? 6 : period === '6M' ? 6 : 12;
    const baseValue = totalSaved > 0 ? totalSaved : 100000;
    const data = [];

    const labels =
      period === '1M'
        ? ['Week 1', 'Week 2', 'Week 3', 'Week 4']
        : period === '3M'
        ? ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
        : period === '6M'
        ? ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
        : ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

    for (let i = 0; i < labels.length; i++) {
      const progressFactor = (i + 1) / labels.length;
      const actualGrowth = Math.round(baseValue * (0.75 + progressFactor * 0.28 + Math.sin(i) * 0.02));
      const benchmarkGrowth = Math.round(baseValue * (0.72 + progressFactor * 0.25));

      data.push({
        label: labels[i],
        actual: actualGrowth,
        target: benchmarkGrowth,
      });
    }

    return data;
  },

  /**
   * Calculates Asset Allocation Breakdown
   */
  calculateAssetAllocation(goals: SavingsGoal[]) {
    const total = goals.reduce((acc, g) => acc + g.currentAmount, 0) || 100000;

    return [
      { name: 'Mutual Funds', value: Math.round(total * 0.42), color: '#10B981' },
      { name: 'Stocks & ETFs', value: Math.round(total * 0.25), color: '#14B8A6' },
      { name: 'Fixed Deposits (FD)', value: Math.round(total * 0.15), color: '#06B6D4' },
      { name: 'Gold & Commodities', value: Math.round(total * 0.10), color: '#F59E0B' },
      { name: 'Emergency Buffer', value: Math.round(total * 0.08), color: '#6366F1' },
    ];
  },
};
