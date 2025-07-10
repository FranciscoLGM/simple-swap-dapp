import { formatUnits } from "viem";

/**
 * Formats a token amount into a human-readable string.
 * - Returns "0" for undefined/null/zero values
 * - Shows no decimals for integer values
 * - Limits decimal places to specified precision for fractional values
 *
 * @param {bigint | undefined} value - The token amount in smallest units (wei)
 * @param {number} [decimals=18] - Number of decimals the token uses (default: 18)
 * @param {number} [precision=2] - Maximum number of decimal places to show (default: 2)
 * @returns {string} Formatted token amount as a human-readable string
 * @example
 * formatTokenAmount(1000000000000000000n); // "1"
 * formatTokenAmount(1234567890000000000n); // "1.23"
 * formatTokenAmount(1500000000000000000n, 18, 4); // "1.5"
 */
export function formatTokenAmount(value?: bigint, decimals: number = 18, precision: number = 2): string {
  if (!value) return "0";

  // Validate parameters
  if (decimals < 0) throw new Error("Decimals must be a positive number");
  if (precision < 0) throw new Error("Precision must be a positive number");

  const formattedValue = formatUnits(value, decimals);
  const numericValue = Number(formattedValue);

  // Return integer values without decimals
  if (Number.isInteger(numericValue)) {
    return numericValue.toString();
  }

  // Format with specified precision and remove trailing zeros
  return numericValue.toFixed(precision).replace(/\.?0+$/, "");
}
