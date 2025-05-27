// Helper function to generate a date string for a specific day offset
const getDateString = (dayOffset) => {
  const date = new Date();
  date.setDate(date.getDate() - dayOffset);
  return date.toISOString().split("T")[0] + "T01:00:00Z";
};

// Helper function to calculate percentage change
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return 100;
  return ((current - previous) / previous) * 100;
};

// Helper function to calculate metric summary
const calculateMetricSummary = (dataPoints, metric) => {
  const averageValue =
    dataPoints.reduce((sum, point) => sum + point[metric], 0) /
    dataPoints.length;
  const todayValue = dataPoints[0][metric];
  const previousValue = dataPoints[dataPoints.length - 1][metric];
  const delta = calculatePercentageChange(todayValue, previousValue);

  return {
    averageValue,
    delta,
  };
};

// Static data for 30 days with criticality-specific values
const staticData = {
  THREE_DAYS: Array.from({ length: 3 }, (_, i) => ({
    timestamp: getDateString(i),
    criticalities: {
      NONE: { cves: [2, 20, 8][i], advisories: [1, 10, 4][i] },
      LOW: { cves: [3, 30, 12][i], advisories: [1, 15, 6][i] },
      MEDIUM: { cves: [2, 25, 10][i], advisories: [1, 12, 5][i] },
      HIGH: { cves: [2, 20, 10][i], advisories: [1, 10, 5][i] },
      CRITICAL: { cves: [1, 15, 7][i], advisories: [1, 8, 3][i] },
    },
  })),
  SEVEN_DAYS: Array.from({ length: 7 }, (_, i) => ({
    timestamp: getDateString(i),
    criticalities: {
      NONE: {
        cves: [2, 20, 8, 8, 15, 25, 20][i],
        advisories: [1, 10, 4, 4, 8, 12, 10][i],
      },
      LOW: {
        cves: [3, 30, 12, 12, 20, 30, 25][i],
        advisories: [1, 15, 6, 6, 10, 15, 12][i],
      },
      MEDIUM: {
        cves: [2, 25, 10, 10, 15, 25, 20][i],
        advisories: [1, 12, 5, 5, 8, 12, 10][i],
      },
      HIGH: {
        cves: [2, 20, 10, 10, 15, 20, 15][i],
        advisories: [1, 10, 5, 5, 8, 10, 8][i],
      },
      CRITICAL: {
        cves: [1, 15, 7, 7, 10, 15, 10][i],
        advisories: [1, 8, 3, 3, 5, 8, 5][i],
      },
    },
  })),
  FOURTEEN_DAYS: Array.from({ length: 14 }, (_, i) => ({
    timestamp: getDateString(i),
    criticalities: {
      NONE: {
        cves: [2, 20, 8, 8, 15, 25, 20, 15, 10, 20, 30, 15, 10, 20][i],
        advisories: [1, 10, 4, 4, 8, 12, 10, 8, 5, 10, 15, 8, 5, 10][i],
      },
      LOW: {
        cves: [3, 30, 12, 12, 20, 30, 25, 20, 15, 25, 35, 20, 15, 25][i],
        advisories: [1, 15, 6, 6, 10, 15, 12, 10, 8, 12, 18, 10, 8, 12][i],
      },
      MEDIUM: {
        cves: [2, 25, 10, 10, 15, 25, 20, 15, 10, 20, 30, 15, 10, 20][i],
        advisories: [1, 12, 5, 5, 8, 12, 10, 8, 5, 10, 15, 8, 5, 10][i],
      },
      HIGH: {
        cves: [2, 20, 10, 10, 15, 20, 15, 10, 5, 15, 20, 10, 5, 15][i],
        advisories: [1, 10, 5, 5, 8, 10, 8, 5, 3, 8, 10, 5, 3, 8][i],
      },
      CRITICAL: {
        cves: [1, 15, 7, 7, 10, 15, 10, 5, 2, 10, 15, 5, 2, 10][i],
        advisories: [1, 8, 3, 3, 5, 8, 5, 3, 1, 5, 8, 3, 1, 5][i],
      },
    },
  })),
  THIRTY_DAYS: Array.from({ length: 30 }, (_, i) => ({
    timestamp: getDateString(i),
    criticalities: {
      NONE: {
        cves: [
          2, 20, 8, 8, 15, 25, 20, 15, 10, 20, 30, 15, 10, 20, 25, 15, 20, 30,
          15, 10, 25, 35, 20, 10, 25, 40, 20, 15, 20, 30,
        ][i],
        advisories: [
          1, 10, 4, 4, 8, 12, 10, 8, 5, 10, 15, 8, 5, 10, 12, 8, 10, 15, 8, 5,
          12, 18, 10, 5, 12, 20, 10, 8, 10, 15,
        ][i],
      },
      LOW: {
        cves: [
          3, 30, 12, 12, 20, 30, 25, 20, 15, 25, 35, 20, 15, 25, 30, 20, 25, 35,
          20, 15, 30, 40, 25, 15, 30, 45, 25, 20, 25, 35,
        ][i],
        advisories: [
          1, 15, 6, 6, 10, 15, 12, 10, 8, 12, 18, 10, 8, 12, 15, 10, 12, 18, 10,
          8, 15, 20, 12, 8, 15, 22, 12, 10, 12, 18,
        ][i],
      },
      MEDIUM: {
        cves: [
          2, 25, 10, 10, 15, 25, 20, 15, 10, 20, 30, 15, 10, 20, 25, 15, 20, 30,
          15, 10, 25, 35, 20, 10, 25, 40, 20, 15, 20, 30,
        ][i],
        advisories: [
          1, 12, 5, 5, 8, 12, 10, 8, 5, 10, 15, 8, 5, 10, 12, 8, 10, 15, 8, 5,
          12, 18, 10, 5, 12, 20, 10, 8, 10, 15,
        ][i],
      },
      HIGH: {
        cves: [
          2, 20, 10, 10, 15, 20, 15, 10, 5, 15, 20, 10, 5, 15, 20, 10, 15, 20,
          10, 5, 20, 25, 15, 5, 20, 30, 15, 10, 15, 20,
        ][i],
        advisories: [
          1, 10, 5, 5, 8, 10, 8, 5, 3, 8, 10, 5, 3, 8, 10, 5, 8, 10, 5, 3, 10,
          12, 8, 3, 10, 15, 8, 5, 8, 10,
        ][i],
      },
      CRITICAL: {
        cves: [
          1, 15, 7, 7, 10, 15, 10, 5, 2, 10, 15, 5, 2, 10, 15, 5, 10, 15, 5, 2,
          15, 20, 10, 2, 15, 25, 10, 5, 10, 15,
        ][i],
        advisories: [
          1, 8, 3, 3, 5, 8, 5, 3, 1, 5, 8, 3, 1, 5, 8, 3, 5, 8, 3, 1, 8, 10, 5,
          1, 8, 12, 5, 3, 5, 8,
        ][i],
      },
    },
  })),
};

// Create arrays for base values
const baseCvesLow = [
  1, 5, 3, 3, 5, 5, 5, 3, 1, 5, 5, 3, 1, 5, 5, 3, 5, 5, 3, 1, 5, 8, 5, 1,
  5, 10, 5, 3, 5, 5,
];

const baseAdvisoriesLow = [
  1, 3, 2, 2, 3, 3, 3, 2, 1, 3, 3, 2, 1, 3, 3, 2, 3, 3, 2, 1, 3, 5, 3,
  1, 3, 8, 3, 2, 3, 3,
];

const baseCvesMedium = [
  1, 8, 5, 5, 8, 8, 8, 5, 2, 8, 8, 5, 2, 8, 8, 5, 8, 8, 5, 2, 8, 12, 8,
  2, 8, 15, 8, 5, 8, 8,
];

const baseAdvisoriesMedium = [
  1, 5, 3, 3, 5, 5, 5, 3, 1, 5, 5, 3, 1, 5, 5, 3, 5, 5, 3, 1, 5, 8, 5,
  1, 5, 10, 5, 3, 5, 5,
];

const baseCvesHigh = [
  1, 12, 6, 6, 9, 12, 9, 6, 2, 9, 12, 6, 2, 9, 12, 6, 9, 12, 6, 2, 12,
  15, 9, 2, 12, 20, 9, 6, 9, 12,
];

const baseAdvisoriesHigh = [
  1, 10, 5, 5, 8, 10, 8, 5, 3, 8, 10, 5, 3, 8, 10, 5, 8, 10, 5, 3, 10,
  12, 8, 3, 10, 15, 8, 5, 8, 10,
];

const baseCvesCritical = [
  1, 15, 7, 7, 10, 15, 10, 5, 2, 10, 15, 5, 2, 10, 15, 5, 10, 15, 5, 2,
  15, 20, 10, 2, 15, 25, 10, 5, 10, 15,
];

const baseAdvisoriesCritical = [
  1, 8, 3, 3, 5, 8, 5, 3, 1, 5, 8, 3, 1, 5, 8, 3, 5, 8, 3, 1, 8, 10, 5,
  1, 8, 12, 5, 3, 5, 8,
];

// Variables for tracking dynamic data
let dynamicMultipliers = Array.from({ length: 30 }, () => 1.0);

// Update the multipliers every few seconds to simulate changing data
setInterval(() => {
  // Randomly choose 1-3 points to update
  const numPointsToUpdate = Math.floor(Math.random() * 3) + 1;
  
  for (let i = 0; i < numPointsToUpdate; i++) {
    // Pick a random point
    const pointIndex = Math.floor(Math.random() * 30);
    
    // Adjust its multiplier slightly (±15%)
    dynamicMultipliers[pointIndex] = Math.max(
      0.7, 
      Math.min(
        1.3, 
        dynamicMultipliers[pointIndex] + (Math.random() * 0.2 - 0.1)
      )
    );
  }
  
  console.log("Updated mock data dynamics");
}, 8000); // Update every 8 seconds

// Base data for time series (now using dynamic multipliers)
const timeSeriesBaseData = {
  timestamps: Array.from({ length: 30 }, (_, i) => getDateString(i)),
  metrics: Array.from({ length: 30 }, (_, i) => ({
    timestamp: getDateString(i),
    criticalityLevels: {
      LOW: {
        cves: Math.max(1, Math.round(baseCvesLow[i] * dynamicMultipliers[i])),
        advisories: Math.max(1, Math.round(baseAdvisoriesLow[i] * dynamicMultipliers[i])),
      },
      MEDIUM: {
        cves: Math.max(1, Math.round(baseCvesMedium[i] * dynamicMultipliers[i])),
        advisories: Math.max(1, Math.round(baseAdvisoriesMedium[i] * dynamicMultipliers[i])),
      },
      HIGH: {
        cves: Math.max(1, Math.round(baseCvesHigh[i] * dynamicMultipliers[i])),
        advisories: Math.max(1, Math.round(baseAdvisoriesHigh[i] * dynamicMultipliers[i])),
      },
      CRITICAL: {
        cves: Math.max(1, Math.round(baseCvesCritical[i] * dynamicMultipliers[i])),
        advisories: Math.max(1, Math.round(baseAdvisoriesCritical[i] * dynamicMultipliers[i])),
      },
    },
  })),
};

// Generate time series data using static data
const generateTimeSeriesData = (
  timeRange = "THIRTY_DAYS",
  criticalities = null
) => {
  // Ensure timeRange is valid, default to THIRTY_DAYS if invalid
  const validTimeRanges = [
    "THREE_DAYS",
    "SEVEN_DAYS",
    "FOURTEEN_DAYS",
    "THIRTY_DAYS",
  ];
  const validTimeRange = validTimeRanges.includes(timeRange)
    ? timeRange
    : "THIRTY_DAYS";

  // Ensure criticalities is an array and contains valid values
  const validCriticalities = ["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"];
  const allCriticalities = validCriticalities;
  const validCriticalityArray =
    Array.isArray(criticalities) && criticalities.length > 0
      ? criticalities.filter((c) => validCriticalities.includes(c))
      : allCriticalities;

  const rawDataPoints = staticData[validTimeRange];

  // Aggregate data points based on requested criticalities
  const dataPoints = rawDataPoints.map((point) => {
    const aggregated = validCriticalityArray.reduce(
      (acc, criticality) => {
        const criticalityData = point.criticalities[criticality];
        return {
          cves: acc.cves + criticalityData.cves,
          advisories: acc.advisories + criticalityData.advisories,
        };
      },
      { cves: 0, advisories: 0 }
    );

    return {
      timestamp: point.timestamp,
      ...aggregated,
    };
  });

  return {
    dataPoints,
    summary: {
      cves: calculateMetricSummary(dataPoints, "cves"),
      advisories: calculateMetricSummary(dataPoints, "advisories"),
      timeRange: validTimeRange,
      criticalities: validCriticalityArray,
    },
  };
};

export { generateTimeSeriesData };
