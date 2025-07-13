import { formatUnits } from "viem";

/**
 * Formats a token amount into a human-readable string.
 *
 * @param value - Amount in base units (bigint or undefined)
 * @param decimals - Token decimals (default: 18)
 * @param precision - Number of decimal places to show (default: 2)
 * @param trimTrailingZeros - Whether to remove trailing zeros (default: true)
 * @returns Formatted string (e.g., "1.23", "0.01")
 */
export function formatTokenAmount(value?: bigint, decimals = 18, precision = 2, trimTrailingZeros = true): string {
  if (!value) return "0";

  const raw = formatUnits(value, decimals);
  const num = parseFloat(raw);

  if (Number.isInteger(num)) return num.toString();

  const formatted = num.toFixed(precision);

  return trimTrailingZeros ? formatted.replace(/\.?0+$/, "") : formatted;
}
