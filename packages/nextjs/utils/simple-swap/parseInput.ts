/**
 * Formats a decimal string to limit its precision.
 * - Preserves integer portion
 * - Truncates (not rounds) decimal portion to specified length
 * - Handles edge cases like missing decimal part
 *
 * @param {string} value - The decimal string to format (e.g. "1.23456789")
 * @param {number} [decimals=2] - Maximum number of decimal places to keep (default: 2)
 * @returns {string} Formatted decimal string (e.g. "1.23")
 * @throws {Error} If input is not a valid decimal string
 * @example
 * formatDecimalInput("123.4567");    // "123.45"
 * formatDecimalInput("100");        // "100"
 * formatDecimalInput("0.12345", 3); // "0.123"
 */
export const formatDecimalInput = (value: string, decimals: number = 2): string => {
  // Input validation
  if (typeof value !== "string") {
    throw new Error("Input must be a string");
  }

  if (!/^-?\d*\.?\d*$/.test(value)) {
    throw new Error("Invalid decimal format");
  }

  const [integerPart, decimalPart] = value.split(".");

  // Return original if no decimal part or decimals is 0
  if (decimals <= 0 || !decimalPart) {
    return integerPart;
  }

  // Format with limited decimals (truncate without rounding)
  const limitedDecimals = decimalPart.slice(0, decimals);
  return `${integerPart}.${limitedDecimals}`;
};
