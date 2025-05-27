import { FC, useState, useEffect } from "react";
import {
  Typography,
  Container,
  useTheme,
  useMediaQuery,
  Box,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { TimeSeriesFilters } from "../../components/filters/TimeSeriesFilters";
import { useTimeSeriesData } from "@/api/hooks/useTimeSeriesData";
import { TimeRange, CriticalityLevel } from "@/types/graphql";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";

export const DashboardPage: FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Get initial filter values or use defaults
  const getInitialTimeRange = (): TimeRange => {
    return TimeRange.SEVEN_DAYS;
  };

  const getInitialCriticalities = (): CriticalityLevel[] => {
    return [
      CriticalityLevel.NONE,
      CriticalityLevel.LOW,
      CriticalityLevel.MEDIUM,
    ];
  };

  // Manage filter state locally
  const [currentTimeRange, setCurrentTimeRange] = useState<TimeRange>(
    getInitialTimeRange()
  );
  const [currentCriticalities, setCurrentCriticalities] = useState<
    CriticalityLevel[]
  >(getInitialCriticalities());

  // Use the hook with the current filter state
  const { data, loading, error, refetch } = useTimeSeriesData({
    timeRange: currentTimeRange,
    criticalities: currentCriticalities,
  });

  // Handle filter changes
  const handleTimeRangeChange = (range: TimeRange) => {
    console.log("Time range changed to:", range);
    setCurrentTimeRange(range);
  };

  const handleCriticalitiesChange = (levels: CriticalityLevel[]) => {
    console.log("Criticality levels changed to:", levels);
    setCurrentCriticalities(levels);
  };

  // Refetch data whenever filters change
  useEffect(() => {
    refetch({
      timeRange: currentTimeRange,
      criticalities: currentCriticalities,
    }).catch((err) => console.error("Refetch error:", err));
  }, [currentTimeRange, currentCriticalities, refetch]);

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4, px: isMobile ? 2 : 3 }}>
      {/* Info panel with accent border */}
      <Paper
        elevation={1}
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
          mb: 2.5,
          bgcolor: theme.palette.background.paper,
          borderLeft: `4px solid ${theme.palette.primary.main}`,
        }}
      >
        <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 500 }}>
          Monitor your security metrics in real-time with interactive
          visualizations
        </Typography>
      </Paper>

      {/* Filter controls */}
      <Paper
        elevation={1}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 2.5,
          borderRadius: 2,
        }}
      >
        <TimeSeriesFilters
          timeRange={currentTimeRange}
          criticalities={currentCriticalities}
          onTimeRangeChange={handleTimeRangeChange}
          onCriticalitiesChange={handleCriticalitiesChange}
        />
      </Paper>

      {/* Chart display */}
      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 400,
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
          }}
        >
          <CircularProgress size={60} thickness={4} />
        </Box>
      )}

      {error && !loading && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
          Error loading security metrics: {error.message}
        </Alert>
      )}

      {!loading && !error && data?.dataPoints?.length === 0 && (
        <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
          No data available for the selected filters. Try adjusting your filter
          criteria.
        </Alert>
      )}

      {!loading && !error && data?.dataPoints && data.dataPoints.length > 0 && (
        <Paper
          elevation={1}
          sx={{
            p: 0,
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <TimeSeriesChart data={data.dataPoints} />
        </Paper>
      )}
    </Container>
  );
};
