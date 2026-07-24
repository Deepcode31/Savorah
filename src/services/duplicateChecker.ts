import { Transaction } from '../types';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  confidence: number;
  reason?: string;
  matchedTransaction?: Transaction;
}

/**
 * Checks if candidate transaction matches any existing transaction
 */
export function checkDuplicateTransaction(
  candidate: { title: string; amount: number; date: string; type?: string },
  existingList: Transaction[] = []
): DuplicateCheckResult {
  if (!existingList || existingList.length === 0) {
    return { isDuplicate: false, confidence: 0 };
  }

  const candidateTitleClean = candidate.title.toLowerCase().replace(/[^a-z0-9]/g, '');
  const candidateAmount = Number(candidate.amount);
  const candidateDate = candidate.date;

  for (const tx of existingList) {
    const existingTitleClean = tx.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const existingAmount = Number(tx.amount);
    const existingDate = tx.date;

    const isExactAmount = Math.abs(candidateAmount - existingAmount) < 0.5;
    const isExactDate = candidateDate === existingDate;
    const isTitleMatch =
      candidateTitleClean.includes(existingTitleClean) ||
      existingTitleClean.includes(candidateTitleClean);

    // Exact match
    if (isExactAmount && isExactDate && isTitleMatch) {
      return {
        isDuplicate: true,
        confidence: 99,
        reason: `Exact match found for "${tx.title}" (₹${tx.amount.toLocaleString()}) on ${tx.date}`,
        matchedTransaction: tx,
      };
    }

    // High similarity match (exact amount + date within 2 days)
    if (isExactAmount && isTitleMatch) {
      const dateDiffDays = Math.abs(
        (new Date(candidateDate).getTime() - new Date(existingDate).getTime()) / (1000 * 3600 * 24)
      );
      if (dateDiffDays <= 2) {
        return {
          isDuplicate: true,
          confidence: 88,
          reason: `Similar transaction "${tx.title}" (₹${tx.amount.toLocaleString()}) recorded on ${tx.date}`,
          matchedTransaction: tx,
        };
      }
    }
  }

  return { isDuplicate: false, confidence: 0 };
}
