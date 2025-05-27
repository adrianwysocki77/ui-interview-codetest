export interface DataPoint {
  timestamp: string;
  cves: number;
  advisories: number;
  id?: string; // Optional ID property that might be in the original DataPoint
}

export interface TimeSeriesChartProps {
  data: DataPoint[];
  height?: number;
}
