import { FC } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
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
    [TimeRange.THREE_DAYS]: "3 Days",
    [TimeRange.SEVEN_DAYS]: "7 Days",
    [TimeRange.FOURTEEN_DAYS]: "14 Days",
    [TimeRange.THIRTY_DAYS]: "30 Days",
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
      tabIndex={-1} // Prevent container from grabbing focus unexpectedly
      elevation={2}
      sx={{ p: 2, borderRadius: 2, mb: 2 }}
      className="filter-container"
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "medium" }}>
        Filter Security Metrics
      </Typography>

      <Stack
        spacing={3}
        direction={{ xs: "column", sm: "row" }}
        sx={{ flexWrap: "wrap" }}
      >
        {/* Time range selector */}
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <AccessTimeIcon fontSize="small" color="primary" />
            <Typography variant="subtitle2">Time Period</Typography>
          </Stack>

          <ToggleButtonGroup
            exclusive
            size="small"
            value={timeRange}
            onChange={(event, newValue) => {
              event.preventDefault(); // Attempt to prevent scroll on change
              if (newValue) {
                onTimeRangeChange(newValue);
              }
            }}
            aria-label="Time range"
            sx={{
              "& .MuiToggleButton-root": {
                px: 2,
                py: 0.5,
                borderRadius: "4px !important",
                mx: 0.5, // Creates space between buttons
                border: `1px solid ${theme.palette.divider}`, // Default border for all
                transition: theme.transitions.create([
                  "background-color",
                  "border-color",
                  "color",
                ]),
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  borderColor: theme.palette.primary.main, // Match border to background or use 'transparent'
                  "&:hover": {
                    bgcolor: "primary.dark",
                    borderColor: theme.palette.primary.dark, // Keep border consistent on hover
                  },
                },
                "&:not(.Mui-selected)": {
                  borderColor:
                    theme.palette.mode === "dark"
                      ? theme.palette.grey[700]
                      : theme.palette.grey[400],
                  color: theme.palette.text.secondary,
                },
                "&:not(.Mui-selected):hover": {
                  backgroundColor: theme.palette.action.hover,
                  borderColor:
                    theme.palette.mode === "dark"
                      ? theme.palette.grey[600]
                      : theme.palette.grey[300],
                },
              },
            }}
          >
            {Object.values(TimeRange).map((r) => (
              <ToggleButton
                key={r}
                value={r}
                aria-label={r}
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
              >
                {timeRangeLabels[r]}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Criticality multi-select */}
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <ReportIcon fontSize="small" color="error" />
            <Typography variant="subtitle2">Criticality Levels</Typography>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            {Object.values(CriticalityLevel).map((level) => {
              const isSelected = criticalities.includes(level);
              return (
                <Chip
                  key={level}
                  label={level}
                  clickable
                  component="div" // Use div instead of button to prevent form submission behavior
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    (e.currentTarget as HTMLElement).blur(); // Remove focus from the chip
                    const newCriticalities = isSelected
                      ? criticalities.filter((c) => c !== level)
                      : [...criticalities, level];

                    // Ensure we always have at least one level selected
                    if (newCriticalities.length > 0) {
                      onCriticalitiesChange(newCriticalities);
                    }
                  }}
                  sx={{
                    my: 0.5,
                    bgcolor: isSelected
                      ? criticalityColors[level]
                      : "transparent",
                    color: isSelected ? "white" : "text.primary",
                    borderColor: criticalityColors[level],
                    border: "1px solid",
                    "&:hover": {
                      bgcolor: isSelected
                        ? criticalityColors[level] + "99" // Adding transparency
                        : criticalityColors[level] + "22",
                    },
                  }}
                />
              );
            })}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};
