/**
 * Formats a decimal string value to limit its precision.
 *
 * @param value - Input string (e.g., "1.23456789")
 * @param decimals - Max number of decimals (default: 2)
 * @returns Truncated decimal string (e.g., "1.23")
 */
export const formatDecimalInput = (value: string, decimals = 2): string => {
  if (!value || typeof value !== "string") return "";

  // Handle edge case: input ends with "." (e.g., "1.")
  if (value.endsWith(".")) return value;

  const [int, dec] = value.split(".");

  // No decimal part or no trimming needed
  if (!dec || decimals === 0) return int;

  // Truncate decimal and combine
  return `${int}.${dec.slice(0, decimals)}`;
};
