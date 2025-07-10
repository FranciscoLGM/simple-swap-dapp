/**
 * Formats a decimal value (as string) to limit its precision.
 *
 * @param {string} value - The input value as a string (e.g. "1.23456789")
 * @param {number} [decimals=2] - Maximum number of decimal places (default: 2)
 * @returns {string} Formatted string (e.g. "1.23")
 *
 * @example
 * // Returns "3.14"
 * formatDecimalInput("3.14159265");
 *
 * @example
 * // Returns "0.1234"
 * formatDecimalInput("0.123456", 4);
 */
export const formatDecimalInput = (value: string, decimals: number = 2): string => {
  const [integerPart, decimalPart] = value.split(".");

  // Return original value if:
  // - No decimal places requested (decimals = 0)
  // - No decimal part exists in input
  if (!decimals || !decimalPart) return value;

  // Combine integer part with truncated decimal part
  return `${integerPart}.${decimalPart.slice(0, decimals)}`;
};
