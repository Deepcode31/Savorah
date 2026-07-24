/** Default display currency for Savorah (Indian Rupees). */
export const CURRENCY = '₹';

export function formatMoney(amount: number, currency: string = CURRENCY): string {
  return `${currency}${Number(amount || 0).toLocaleString('en-IN')}`;
}
