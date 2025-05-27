import { FC, useEffect, useRef } from "react";
import * as d3 from "d3";
import { DataPoint } from "@/types/graphql";
import { Box, Paper, Typography, useTheme } from "@mui/material";

export type TimeSeriesChartProps = {
  /**
   * Array of datapoints returned by the GraphQL API.
   */
  data: DataPoint[];
  /**
   * Height of the SVG. Width will stretch to 100% of the parent container.
   * Default: 400px
   */
  height?: number;
};

/**
 * Responsive line-chart drawn with D3. Shows two metrics (CVEs & Advisories)
 * on the same time axis. Colours follow the Material-UI primary & error
 * palette colours. The component is completely presentational – all data &
 * formatting are provided via props.
 */
export const TimeSeriesChart: FC<TimeSeriesChartProps> = ({
  data,
  height = 400,
}) => {
  const theme = useTheme();
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Render chart whenever data changes or theme changes
  useEffect(() => {
    if (!data?.length || !svgRef.current) {
      return;
    }

    // Colors based on theme
    const primaryColor = theme.palette.primary.main;
    const errorColor = theme.palette.error.main;
    const axisColor = theme.palette.text.secondary;

    const svg = d3.select(svgRef.current);
    // Clear previous contents
    svg.selectAll("*").remove();

    // Dimensions & margins
    const width = svgRef.current.clientWidth || 800; // fallback
    const margin = { top: 20, right: 50, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Parse ISO timestamp strings to Date objects
    const parseDate = (d: string) => new Date(d);

    // Scales
    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => parseDate(d.timestamp)) as [Date, Date])
      .range([0, innerWidth]);

    const yMax = d3.max(data, (d) => Math.max(d.cves, d.advisories)) ?? 0;
    const y = d3.scaleLinear().domain([0, yMax]).nice().range([innerHeight, 0]);

    // Line generators
    const lineCves = d3
      .line<DataPoint>()
      .x((d) => x(parseDate(d.timestamp)))
      .y((d) => y(d.cves))
      .curve(d3.curveMonotoneX);

    const lineAdvisories = d3
      .line<DataPoint>()
      .x((d) => x(parseDate(d.timestamp)))
      .y((d) => y(d.advisories))
      .curve(d3.curveMonotoneX);

    // Main group translated by margins
    const g = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add background grid
    g.append("g")
      .attr("class", "grid")
      .selectAll("line")
      .data(y.ticks(6))
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", (d) => y(d))
      .attr("y2", (d) => y(d))
      .attr("stroke", theme.palette.divider)
      .attr("stroke-width", 0.5)
      .attr("stroke-dasharray", "3,3");

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(6).tickSizeOuter(0))
      .attr("color", axisColor)
      .append("text")
      .attr("fill", axisColor)
      .attr("text-anchor", "middle")
      .attr("x", innerWidth / 2)
      .attr("y", 35)
      .text("Date");

    g.append("g")
      .call(d3.axisLeft(y).ticks(6))
      .attr("color", axisColor)
      .append("text")
      .attr("fill", axisColor)
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -40)
      .text("Count");

    // Add legend
    const legend = g
      .append("g")
      .attr("transform", `translate(${innerWidth - 100}, 0)`);

    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", primaryColor);

    legend
      .append("text")
      .attr("x", 15)
      .attr("y", 10)
      .text("CVEs")
      .attr("fill", axisColor);

    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 20)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", errorColor);

    legend
      .append("text")
      .attr("x", 15)
      .attr("y", 30)
      .text("Advisories")
      .attr("fill", axisColor);

    // Vertical hover line (crosshair)
    const hoverLine = g
      .append("line")
      .attr("class", "hover-line")
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", axisColor)
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4")
      .style("pointer-events", "none")
      .style("opacity", 0);

    // Lines with animation
    const cveLine = g
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", primaryColor)
      .attr("stroke-width", 2)
      .attr("d", lineCves);

    // Animate path
    const cvePathLength = cveLine.node()?.getTotalLength() || 0;
    cveLine
      .attr("stroke-dasharray", cvePathLength)
      .attr("stroke-dashoffset", cvePathLength)
      .transition()
      .duration(1000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);

    const advisoryLine = g
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", errorColor)
      .attr("stroke-width", 2)
      .attr("d", lineAdvisories);

    // Animate path
    const advisoryPathLength = advisoryLine.node()?.getTotalLength() || 0;
    advisoryLine
      .attr("stroke-dasharray", advisoryPathLength)
      .attr("stroke-dashoffset", advisoryPathLength)
      .transition()
      .duration(1000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);

    // Create tooltip elements - make it more visible and ensure it doesn't interfere with mouse events
    const tooltip = svg
      .append("g")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("pointer-events", "none");

    tooltip
      .append("rect")
      .attr("width", 160)
      .attr("height", 80)
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("fill", theme.palette.background.paper)
      .attr("stroke", theme.palette.divider)
      .attr("stroke-width", 1.5) // Make border more visible
      .style("filter", "drop-shadow(0px 2px 3px rgba(0,0,0,0.2))");

    const tooltipTitle = tooltip
      .append("text")
      .attr("x", 10)
      .attr("y", 20)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", theme.palette.text.primary);

    const tooltipCVEs = tooltip
      .append("text")
      .attr("x", 10)
      .attr("y", 40)
      .attr("font-size", "12px")
      .attr("fill", primaryColor);

    const tooltipAdvisories = tooltip
      .append("text")
      .attr("x", 10)
      .attr("y", 60)
      .attr("font-size", "12px")
      .attr("fill", errorColor);

    // Format date for tooltips
    const formatDate = (isoString: string) => {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    const points = g
      .selectAll(".data-point")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "data-point")
      .style("cursor", "pointer");

    points
      .append("circle")
      .attr("cx", (d) => x(new Date(d.timestamp)))
      .attr("cy", (d) => y(d.cves))
      .attr("r", 0)
      .attr("fill", theme.palette.primary.main)
      .transition()
      .delay((_, i) => i * 100)
      .duration(500)
      .attr("r", 4);

    points
      .append("circle")
      .attr("cx", (d) => x(new Date(d.timestamp)))
      .attr("cy", (d) => y(d.advisories))
      .attr("r", 0)
      .attr("fill", theme.palette.error.main)
      .transition()
      .delay((_, i) => i * 100)
      .duration(500)
      .attr("r", 4);

    points.each(function (d) {
      const pointGroup = d3.select(this);

      pointGroup
        .append("circle")
        .attr("cx", (d) => x(new Date(d.timestamp)))
        .attr("cy", (d) => y(d.cves))
        .attr("r", 15)
        .attr("fill", "transparent")
        .attr("class", "hit-area")
        .style("pointer-events", "all")
        .datum(d)
        .on("mouseover", function (event, dataPoint) {
          const xPos = x(new Date(dataPoint.timestamp));
          const minYValue = Math.min(
            y(dataPoint.cves),
            y(dataPoint.advisories)
          );
          const yPos = minYValue < 100 ? minYValue + 30 : minYValue - 90;

          tooltip
            .style("opacity", 1)
            .attr("transform", `translate(${xPos - 80},${yPos})`);

          tooltipTitle.text(formatDate(dataPoint.timestamp));
          tooltipCVEs.text(`CVEs: ${dataPoint.cves}`);
          tooltipAdvisories.text(`Advisories: ${dataPoint.advisories}`);

          hoverLine.attr("x1", xPos).attr("x2", xPos).style("opacity", 1);

          points
            .selectAll("circle:not(.hit-area)")
            .attr("r", (p) => (p.timestamp === dataPoint.timestamp ? 6 : 4))
            .attr("stroke", (p) =>
              p.timestamp === dataPoint.timestamp
                ? theme.palette.background.paper
                : "none"
            )
            .attr("stroke-width", (p) =>
              p.timestamp === dataPoint.timestamp ? 2 : 0
            );
        })
        .on("mouseout", function () {
          setTimeout(() => {
            tooltip.style("opacity", 0);
          }, 300);

          setTimeout(() => {
            points
              .selectAll("circle:not(.hit-area)")
              .attr("r", 4)
              .attr("stroke", "none");
          }, 300);
        });

      pointGroup
        .append("circle")
        .attr("cx", (d) => x(new Date(d.timestamp)))
        .attr("cy", (d) => y(d.advisories))
        .attr("r", 15)
        .attr("fill", "transparent")
        .attr("class", "hit-area")
        .style("pointer-events", "all")
        .datum(d)
        .on("mouseover", function (event, dataPoint) {
          const xPos = x(new Date(dataPoint.timestamp));
          const minYValue = Math.min(
            y(dataPoint.cves),
            y(dataPoint.advisories)
          );
          const yPos = minYValue < 100 ? minYValue + 30 : minYValue - 90;

          tooltip
            .style("opacity", 1)
            .attr("transform", `translate(${xPos - 80},${yPos})`);

          tooltipTitle.text(formatDate(dataPoint.timestamp));
          tooltipCVEs.text(`CVEs: ${dataPoint.cves}`);
          tooltipAdvisories.text(`Advisories: ${dataPoint.advisories}`);

          hoverLine.attr("x1", xPos).attr("x2", xPos).style("opacity", 1);

          points
            .selectAll("circle:not(.hit-area)")
            .attr("r", (p) => (p.timestamp === dataPoint.timestamp ? 6 : 4))
            .attr("stroke", (p) =>
              p.timestamp === dataPoint.timestamp
                ? theme.palette.background.paper
                : "none"
            )
            .attr("stroke-width", (p) =>
              p.timestamp === dataPoint.timestamp ? 2 : 0
            );
        })
        .on("mouseout", function () {
          setTimeout(() => {
            tooltip.style("opacity", 0);
          }, 300);

          setTimeout(() => {
            points
              .selectAll("circle:not(.hit-area)")
              .attr("r", 4)
              .attr("stroke", "none");
          }, 300);
        });
    });

    d3.select(svgRef.current)
      .on("mousemove", function (event) {
        const gElement = g.node();
        if (!gElement) return;
        const [mouseX] = d3.pointer(event, gElement);
        const chartX = mouseX; // already relative to chart's inner area

        if (chartX < 0 || chartX > innerWidth) {
          hoverLine.style("opacity", 0);
          return;
        }

        // Always position hover line based on direct mouse position
        hoverLine.attr("x1", chartX).attr("x2", chartX).style("opacity", 1);
      })
      .on("mouseleave", function () {
        hoverLine.style("opacity", 0);
        tooltip.style("opacity", 0);

        // Reset points
        points
          .selectAll("circle:not(.hit-area)")
          .attr("r", 4)
          .attr("stroke", "none");
      });
  }, [data, height, theme]); // Added theme to dependencies

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        borderRadius: 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "medium" }}>
        Security Metrics Timeline
      </Typography>

      <Box sx={{ position: "relative" }}>
        <svg
          ref={svgRef}
          width="100%"
          height={height}
          tabIndex={-1} // Make SVG non-focusable
          style={{
            display: "block",
            maxWidth: "100%",
          }}
        />
      </Box>
    </Paper>
  );
};
