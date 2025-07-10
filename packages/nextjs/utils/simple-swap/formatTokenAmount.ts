import { formatUnits } from "viem";

/**
 * Formats a token amount into a human-readable string.
 * Displays as integer if whole number, otherwise limits to specified precision.
 *
 * @param {bigint | undefined} value - The token amount in smallest units (wei/satoshi)
 * @param {number} [decimals=18] - Token decimals (default: 18)
 * @param {number} [precision=2] - Maximum decimal places to show (default: 2)
 * @returns {string} Formatted token amount as string
 *
 * @example
 * // Returns "1"
 * formatTokenAmount(1000000000000000000n);
 *
 * @example
 * // Returns "1.2345"
 * formatTokenAmount(123456789n, 8, 4);
 *
 * @example
 * // Returns "0" for undefined input
 * formatTokenAmount(undefined);
 */
export function formatTokenAmount(value?: bigint, decimals: number = 18, precision: number = 2): string {
  // Handle undefined/zero value
  if (!value) return "0";

  // Convert from smallest units to token amount
  const rawAmount = formatUnits(value, decimals);
  const numericAmount = Number(rawAmount);

  // Return integer representation if whole number
  if (Number.isInteger(numericAmount)) {
    return numericAmount.toString();
  }

  // Format with limited decimal places
  return numericAmount.toFixed(precision).replace(/\.?0+$/, "");
}
