import { FC } from "react";
import {
  Paper,
  Typography,
  Stack,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from "@mui/material";
import { TimeRange, CriticalityLevel } from "@/types/graphql";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ReportIcon from "@mui/icons-material/Report";

export interface TimeSeriesFiltersProps {
  timeRange: TimeRange;
  criticalities: CriticalityLevel[];
  onTimeRangeChange: (range: TimeRange) => void;
  onCriticalitiesChange: (levels: CriticalityLevel[]) => void;
}

export const TimeSeriesFilters: FC<TimeSeriesFiltersProps> = ({
  timeRange,
  criticalities,
  onTimeRangeChange,
  onCriticalitiesChange,
}) => {
  const theme = useTheme();

  // Map the enum values to more readable display text
  const timeRangeLabels: Record<TimeRange, string> = {
    [TimeRange.THREE_DAYS]: "3 DAYS",
    [TimeRange.SEVEN_DAYS]: "7 DAYS",
    [TimeRange.FOURTEEN_DAYS]: "14 DAYS",
    [TimeRange.THIRTY_DAYS]: "30 DAYS",
  };

  // Map criticality levels to colors
  const criticalityColors: Record<CriticalityLevel, string> = {
    [CriticalityLevel.NONE]: theme.palette.success.main,
    [CriticalityLevel.LOW]: theme.palette.info.main,
    [CriticalityLevel.MEDIUM]: theme.palette.warning.main,
    [CriticalityLevel.HIGH]: theme.palette.error.main,
    [CriticalityLevel.CRITICAL]: theme.palette.error.dark,
  };

  return (
    <Paper
      tabIndex={-1}
      elevation={2}
      sx={{
        p: 2,
        borderRadius: 2,
        mb: 2,
        backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "medium" }}>
        Filter Security Metrics
      </Typography>

      {/* Time range selector */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <AccessTimeIcon fontSize="small" color="primary" />
        <Typography variant="subtitle2">Time Period</Typography>
      </Stack>

      <ToggleButtonGroup
        exclusive
        size="small"
        value={timeRange}
        onChange={(event, newValue) => {
          event.preventDefault();
          if (newValue) {
            onTimeRangeChange(newValue);
          }
        }}
        aria-label="Time range"
        sx={{
          mb: 3,
          display: "flex",
          width: "100%",
          "& .MuiToggleButton-root": {
            flex: 1,
            py: 0.75,
            fontSize: "0.75rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            color: theme.palette.text.secondary,
            border: `1px solid ${theme.palette.divider}`,
            "&.Mui-selected": {
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              borderColor: theme.palette.primary.main,
              fontWeight: 600,
              "&:hover": {
                bgcolor: theme.palette.primary.dark,
              },
            },
            "&:hover": {
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(0, 0, 0, 0.04)",
            },
          },
          "& .MuiToggleButtonGroup-grouped:not(:first-of-type)": {
            borderLeft: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        {Object.values(TimeRange).map((r) => (
          <ToggleButton key={r} value={r} aria-label={r}>
            {timeRangeLabels[r]}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {/* Criticality multi-select */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <ReportIcon fontSize="small" color="error" />
        <Typography variant="subtitle2">Criticality Levels</Typography>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          gap: 1,
          width: "100%",
        }}
      >
        {Object.values(CriticalityLevel).map((level) => {
          const isSelected = criticalities.includes(level);
          return (
            <Box
              key={level}
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                const newCriticalities = isSelected
                  ? criticalities.filter((c) => c !== level)
                  : [...criticalities, level];

                if (newCriticalities.length > 0) {
                  onCriticalitiesChange(newCriticalities);
                }
              }}
              sx={{
                p: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "32px",
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                borderRadius: 1,
                cursor: "pointer",
                transition: theme.transitions.create([
                  "background-color",
                  "box-shadow",
                  "border-color",
                ]),
                bgcolor: isSelected ? criticalityColors[level] : "transparent",
                color: isSelected ? "#fff" : theme.palette.text.primary,
                border: `1px solid ${
                  isSelected ? criticalityColors[level] : theme.palette.divider
                }`,
                "&:hover": {
                  bgcolor: isSelected
                    ? criticalityColors[level]
                    : theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(0, 0, 0, 0.04)",
                  boxShadow: isSelected
                    ? "none"
                    : `0 0 0 1px ${criticalityColors[level]}`,
                },
              }}
            >
              {level}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};
