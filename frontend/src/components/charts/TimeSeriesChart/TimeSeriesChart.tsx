import { FC, useRef } from "react";
import { Box, Paper, Typography, useTheme } from "@mui/material";
import { TimeSeriesChartProps } from "./types";
import { useTimeSeriesD3 } from "./hooks/useTimeSeriesD3";

/**
 * Responsive line-chart drawn with D3. Shows two metrics (CVEs & Advisories)
 * on the same time axis. Colours follow the Material-UI primary & error
 * palette colours. The component is completely presentational – all data &
 * formatting are provided via props.
 */
export const TimeSeriesChart: FC<TimeSeriesChartProps> = ({ 
  data, 
  height = 400 
}) => {
  const theme = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Use our custom D3 hook to handle all the chart rendering
  useTimeSeriesD3(svgRef as React.RefObject<SVGSVGElement>, data, height, theme);

  // Calculate responsive dimensions
  const containerWidth = typeof window !== "undefined" ? window.innerWidth : 800;
  const isMobileView = containerWidth < 500;
  const mobileHeight = isMobileView
    ? Math.max(height, containerWidth * 0.8)
    : height;

  return (
    <Paper
      elevation={2}
      sx={{
        p: isMobileView ? 1.5 : 2,
        borderRadius: 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "medium" }}>
        Security Metrics Timeline
      </Typography>

      <Box
        sx={{
          position: "relative",
          minHeight: isMobileView ? mobileHeight : "auto",
          "&:focus": { outline: "none" },
          "&:focus-visible": { outline: "none" },
        }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height={mobileHeight}
          tabIndex={-1} // Make SVG non-focusable
          style={{
            display: "block",
            maxWidth: "100%",
            outline: "none", // Remove focus outline
          }}
          onClick={(e) => e.currentTarget.blur()} // Remove focus when clicked
        />
      </Box>
    </Paper>
  );
};
