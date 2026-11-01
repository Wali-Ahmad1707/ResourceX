/**
 * Universal Currency & Formatting Utilities for ResourceX
 * Safe for both Client and Server components (zero node:* dependencies)
 */

/**
 * Converts human readable deposit string (e.g. "$50", "₹1,500", "$0 (Free)")
 * into integer paise (1 INR = 100 paise) avoiding floating-point inaccuracies.
 */
export function parseDepositToPaise(depositStr?: string): number {
  if (!depositStr) return 0;
  const clean = depositStr.toLowerCase().replace(/free/g, "").replace(/[^0-9.]/g, "");
  const num = parseFloat(clean);
  if (isNaN(num) || num <= 0) return 0;
  return Math.round(num * 100);
}

/**
 * Format paise back into formatted INR currency string.
 */
export function formatPaiseToINR(paise: number): string {
  const rupees = (paise / 100).toFixed(2);
  return `₹${rupees}`;
}
