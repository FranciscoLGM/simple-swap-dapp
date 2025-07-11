import { formatUnits } from "viem";

/**
 * Formats a token amount into a human-readable string.
 *
 * Features:
 * - Handles undefined/zero values gracefully
 * - Shows no decimals for integer values
 * - Limits decimal places for fractional values
 * - Configurable decimal precision
 *
 * @param {bigint | undefined} value - Valor bigint en base `decimals` (undefined treated as 0)
 * @param {number} [decimals=18] - Cantidad de decimales del token (por defecto: 18)
 * @param {number} [precision=2] - Cantidad máxima de decimales visibles (por defecto: 2)
 * @returns {string} Formatted token amount as string
 *
 * @example
 * formatTokenAmount(1234567890000000000n); // "1.23" (18 decimals)
 * formatTokenAmount(1000000000000000000n); // "1" (integer)
 * formatTokenAmount(1234567890000000000n, 18, 4); // "1.2345"
 */
export function formatTokenAmount(value?: bigint, decimals = 18, precision = 2): string {
  // Handle undefined or zero values
  if (!value) return "0";

  // Convert from smallest units to token units
  const raw = formatUnits(value, decimals);
  const num = Number(raw);

  // Return integer values without decimals
  if (Number.isInteger(num)) return num.toString();

  // Format fractional values with specified precision
  return num.toFixed(precision);
}
