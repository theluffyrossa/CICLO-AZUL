/**
 * Safely converts a value to a number
 * @param value - Value that might be a string, number, or undefined
 * @param fallback - Fallback value if conversion fails (default: 0)
 * @returns A valid number
 */
export const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  }

  return fallback;
};

/**
 * Safely formats a number with fixed decimal places
 * @param value - Value to format
 * @param decimals - Number of decimal places (default: 2)
 * @param fallback - Fallback value if conversion fails (default: 0)
 * @returns Formatted string
 */
export const formatNumber = (value: unknown, decimals = 2, fallback = 0): string => {
  const num = toNumber(value, fallback);
  return num.toFixed(decimals);
};

/**
 * Safely sums an array of numeric values
 * @param values - Array of values that might be strings or numbers
 * @returns Sum as a number
 */
export const safeSum = (values: unknown[]): number => {
  return values.reduce((sum, value) => sum + toNumber(value, 0), 0);
};
