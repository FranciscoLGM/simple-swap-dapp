/**
 * Formats a decimal string value to limit its precision.
 *
 * Features:
 * - Handles both integer and decimal inputs
 * - Preserves integer portion exactly
 * - Truncates (not rounds) decimal portion
 * - Configurable decimal precision
 * - Returns original string if no decimal portion exists
 *
 * @param {string} value - Valor ingresado como string (ej: "1.23456789")
 * @param {number} [decimals=2] - Número máximo de decimales (default: 2)
 * @returns {string} Cadena formateada (ej: "1.23")
 *
 * @example
 * formatDecimalInput("123")       // "123"
 * formatDecimalInput("123.456")   // "123.45"
 * formatDecimalInput("123.456", 4) // "123.456"
 * formatDecimalInput("abc")       // "abc" (no validation)
 */
export const formatDecimalInput = (value: string, decimals = 2): string => {
  // Split into integer and decimal parts
  const [int, dec] = value.split(".");

  // Return original if:
  // - No decimal places requested (decimals = 0)
  // - No decimal portion exists
  // - Input is malformed (no split possible)
  if (!decimals || !dec) return value;

  // Recombine integer portion with truncated decimals
  return `${int}.${dec.slice(0, decimals)}`;
};
