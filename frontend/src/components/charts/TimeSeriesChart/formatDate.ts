/**
 * Date formatting utilities for the TimeSeriesChart
 */

/**
 * Format date for tooltips and display
 * @param isoString - ISO date string to format
 * @returns Formatted date string
 */
export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Parse ISO timestamp strings to Date objects.
 * If the incoming string lacks an explicit timezone (`Z` or offset), assume **UTC** instead of the
 * browser’s local timezone. This keeps data points and the X-axis aligned regardless of the
 * viewer’s locale (fixes the left-shifted axis / misaligned hover line issue).
 */
export const parseDate = (dateString: string): Date => {
  // If the date already contains an explicit timezone, let the JS engine handle it.
  if (/([zZ]|[+-]\d{2}:?\d{2})$/.test(dateString)) {
    return new Date(dateString);
  }

  // Otherwise, treat it as UTC by appending 'Z'
  return new Date(`${dateString}Z`);
};
