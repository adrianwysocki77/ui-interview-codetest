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
 * Parse ISO timestamp strings to Date objects
 * @param dateString - ISO date string to parse
 * @returns Date object
 */
export const parseDate = (dateString: string): Date => new Date(dateString);
