/**
 * Types used by the TimeSeriesChart component
 */

export interface DataPoint {
  timestamp: string;
  cves: number;
  advisories: number;
  id?: string; // Optional ID property that might be in the original DataPoint
}

export interface TimeSeriesChartProps {
  /**
   * Array of datapoints returned by the GraphQL API.
   */
  data: DataPoint[];
  /**
   * Height of the SVG. Width will stretch to 100% of the parent container.
   * Default: 400px
   */
  height?: number;
}
