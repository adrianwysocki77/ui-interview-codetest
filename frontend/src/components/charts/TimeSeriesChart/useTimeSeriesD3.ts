import { useEffect, RefObject, useRef } from "react";
import * as d3 from "d3";
import { Theme } from "@mui/material";
import { DataPoint } from "./types";
import { parseDate } from "./formatDate";
import { createDataPointHandlers } from "./interactionHandlers";

/**
 * Hook for rendering the Time Series chart using D3
 */
export const useTimeSeriesD3 = (
  svgRef: RefObject<SVGSVGElement>,
  data: DataPoint[],
  height: number,
  theme: Theme
) => {
  // Store chart elements that should persist between renders
  const chartRef = useRef<{
    initialized: boolean;
    svg?: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    chartGroup?: d3.Selection<SVGGElement, unknown, null, undefined>;
    xAxis?: d3.Selection<SVGGElement, unknown, null, undefined>;
    yAxis?: d3.Selection<SVGGElement, unknown, null, undefined>;
    tooltip?: d3.Selection<SVGGElement, unknown, null, undefined>;
    tooltipTitle?: d3.Selection<SVGTextElement, unknown, null, undefined>;
    tooltipCVEs?: d3.Selection<SVGTextElement, unknown, null, undefined>;
    tooltipAdvisories?: d3.Selection<SVGTextElement, unknown, null, undefined>;
    hoverLine?: d3.Selection<SVGLineElement, unknown, null, undefined>;
    dynamicContent?: d3.Selection<SVGGElement, unknown, null, undefined>;
  }>({ initialized: false });

  // Store dimension values for reuse
  const dimensionsRef = useRef<{
    width: number;
    innerWidth: number;
    innerHeight: number;
    isMobile: boolean;
  }>({ width: 0, innerWidth: 0, innerHeight: 0, isMobile: false });

  // One-time setup effect - creates static elements
  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    // Initialize or reference the SVG
    chartRef.current.svg = d3.select(svgRef.current);

    // Only initialize once
    if (chartRef.current.initialized) return;

    // Check if we're on mobile for responsive adjustments
    const width = svgRef.current.clientWidth || 800; // fallback
    const isMobile = width < 500;

    // Adjust margins based on screen width for better mobile display
    const margin = isMobile
      ? { top: 15, right: 30, bottom: 30, left: 40 } // Smaller margins on mobile
      : { top: 20, right: 50, bottom: 40, left: 60 };

    // For mobile, use a taller chart relative to the width for better visibility
    const adjustedHeight = isMobile ? Math.max(height, width * 0.8) : height;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = adjustedHeight - margin.top - margin.bottom;

    // Colors based on theme
    const primaryColor = theme.palette.primary.main;
    const errorColor = theme.palette.error.main;
    const axisColor = theme.palette.text.secondary;

    // Store dimensions for reuse
    dimensionsRef.current = {
      width,
      innerWidth,
      innerHeight,
      isMobile,
    };

    // Get the SVG selection
    const svg = chartRef.current.svg;
    if (!svg) return;

    // We've already created the scales above, no need to duplicate this code

    // Set up the SVG and main group
    svg
      .attr("viewBox", `0 0 ${width} ${adjustedHeight}`)
      .attr("preserveAspectRatio", "xMinYMin meet");

    const g = svg
      .append("g")
      .attr("class", "chart-container")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Store the main group reference
    chartRef.current.chartGroup = g;
    chartRef.current.dynamicContent = g
      .append("g")
      .attr("class", "dynamic-content");

    // Add background grid group (content will be populated in data effect)
    g.append("g").attr("class", "grid");

    // Add X-axis group (content will be set in data effect)
    const xAxisGroup = g
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerHeight})`);

    // Add axis title
    xAxisGroup
      .append("text")
      .attr("fill", axisColor)
      .attr("text-anchor", "middle")
      .attr("x", innerWidth / 2)
      .attr("y", 40)
      .text("Date");

    chartRef.current.xAxis = xAxisGroup;

    // Add Y-axis group (content will be set in data effect)
    const yAxisGroup = g.append("g").attr("class", "y-axis");

    // Add axis title
    yAxisGroup
      .append("text")
      .attr("fill", axisColor)
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -35)
      .text("Count");

    chartRef.current.yAxis = yAxisGroup;

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

    // Add vertical hover line (crosshair)
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

    chartRef.current.hoverLine = hoverLine;

    // Make sure dynamic content container exists
    if (!chartRef.current.dynamicContent) {
      chartRef.current.dynamicContent = g.select(".dynamic-content");
    }

    // Mark as initialized
    chartRef.current.initialized = true;

    // Create tooltip INSIDE chart group so coordinates match x/y scales
    const tooltip = g
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
      .attr("stroke-width", 1.5)
      .style("filter", "drop-shadow(0px 2px 3px rgba(0,0,0,0.2))");

    const tooltipTitle = tooltip
      .append("text")
      .attr("class", "tooltip-title")
      .attr("x", 10)
      .attr("y", 20)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", theme.palette.text.primary);

    const tooltipCVEs = tooltip
      .append("text")
      .attr("class", "tooltip-cves")
      .attr("x", 10)
      .attr("y", 40)
      .attr("font-size", "12px")
      .attr("fill", primaryColor);

    const tooltipAdvisories = tooltip
      .append("text")
      .attr("class", "tooltip-advisories")
      .attr("x", 10)
      .attr("y", 60)
      .attr("font-size", "12px")
      .attr("fill", errorColor);

    // Store tooltip references
    chartRef.current.tooltip = tooltip;
    chartRef.current.tooltipTitle = tooltipTitle;
    chartRef.current.tooltipCVEs = tooltipCVEs;
    chartRef.current.tooltipAdvisories = tooltipAdvisories;

    // Store dimensions for reuse
    dimensionsRef.current = {
      width,
      innerWidth,
      innerHeight,
      isMobile,
    };
  }, [data.length, height, theme, svgRef]);

  // Data-dependent update effect
  useEffect(() => {
    if (!svgRef.current || !data.length || !chartRef.current.initialized)
      return;

    // Reference to main chart elements
    const g = chartRef.current.chartGroup;
    const dynamicContent = chartRef.current.dynamicContent;

    if (!g || !dynamicContent) return;

    // Access stored references
    const svg = chartRef.current.svg;
    if (!svg) return;
    const width = svgRef.current.clientWidth || 800;
    const isMobile = width < 500;

    // Adjust margins based on screen width
    const margin = isMobile
      ? { top: 15, right: 30, bottom: 30, left: 40 }
      : { top: 20, right: 50, bottom: 40, left: 60 };

    const adjustedHeight = isMobile ? Math.max(height, width * 0.8) : height;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = adjustedHeight - margin.top - margin.bottom;

    // Colors from theme
    const primaryColor = theme.palette.primary.main;
    const errorColor = theme.palette.error.main;
    const axisColor = theme.palette.text.secondary;

    // Update scales with new data
    // Use UTC scale to avoid timezone-induced shifts when rendering points & axis
    const x = d3
      .scaleUtc()
      .domain(d3.extent(data, (d) => parseDate(d.timestamp)) as [Date, Date])
      .range([0, innerWidth]);

    const yMax = d3.max(data, (d) => Math.max(d.cves, d.advisories)) ?? 0;
    const y = d3
      .scaleLinear()
      .domain([0, yMax * 1.1])
      .nice()
      .range([innerHeight, 0]);

    // Update grid with transition
    const grid = g.select(".grid");
    const gridLines = grid
      .selectAll<SVGLineElement, number>("line")
      .data(y.ticks(6));

    // Exit - remove any extra grid lines
    gridLines.exit().remove();

    // Enter - add new grid lines
    const gridEnter = gridLines
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("stroke", theme.palette.divider)
      .attr("stroke-width", 0.5)
      .attr("stroke-dasharray", "3,3");

    // Update - position all grid lines (new and existing)
    gridEnter
      .merge(gridLines)
      .transition()
      .duration(750)
      .attr("y1", (d) => y(d))
      .attr("y2", (d) => y(d));

    // Update X-axis with transition
    if (chartRef.current.xAxis) {
      // Calculate a reasonable number of ticks based on data length
      let tickValues = Array.from(
        new Set(data.map((d) => parseDate(d.timestamp).getTime()))
      ).map((t) => new Date(t));
      
      // If we have many days (e.g. 30 days), only show a subset of dates to prevent overlapping
      if (tickValues.length > 10) {
        const step = Math.ceil(tickValues.length / (isMobile ? 5 : 10));
        tickValues = tickValues.filter((_, i) => i % step === 0);
      }

      // Create and apply the axis
      const axis = d3
        .axisBottom(x as unknown as d3.AxisScale<Date>)
        .tickValues(tickValues)
        .tickFormat((domainValue) => d3.timeFormat("%b %d")(domainValue as Date))
        .tickSizeOuter(0)
        .tickPadding(10);
      
      chartRef.current.xAxis
        .transition()
        .duration(750)
        .call(function(g) {
          axis(g);
        })
        .attr("color", axisColor)
        .attr("font-size", isMobile ? "10px" : "12px");
    }

    // Update Y-axis with transition
    if (chartRef.current.yAxis) {
      chartRef.current.yAxis
        .transition()
        .duration(750)
        .call(d3.axisLeft(y).ticks(6))
        .attr("color", axisColor)
        .attr("font-size", isMobile ? "10px" : "12px");
    }

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

    // DATA JOIN: CVE Line
    const cveLine = dynamicContent
      .selectAll<SVGPathElement, DataPoint[]>(".line-cves")
      .data([data]); // Wrap in array because we want a single path

    // ENTER: CVE Line
    const cveEnter = cveLine
      .enter()
      .append("path")
      .attr("class", "line-cves")
      .attr("fill", "none")
      .attr("stroke", primaryColor)
      .attr("stroke-width", 2);

    // UPDATE + ENTER: CVE Line
    cveLine.merge(cveEnter).transition().duration(750).attr("d", lineCves);

    // DATA JOIN: Advisory Line
    const advLine = dynamicContent
      .selectAll<SVGPathElement, DataPoint[]>(".line-advisories")
      .data([data]);

    // ENTER: Advisory Line
    const advEnter = advLine
      .enter()
      .append("path")
      .attr("class", "line-advisories")
      .attr("fill", "none")
      .attr("stroke", errorColor)
      .attr("stroke-width", 2);

    // UPDATE + ENTER: Advisory Line
    advLine
      .merge(advEnter)
      .transition()
      .duration(750)
      .attr("d", lineAdvisories);

    // DATA JOIN: Point Groups (keyed by timestamp for proper updating)
    const pointGroups = dynamicContent
      .selectAll<SVGGElement, DataPoint>(".data-point")
      .data(data, (d: DataPoint, i) => d.id ?? `${d.timestamp}-${i}`);

    // EXIT: Point Groups
    pointGroups.exit().transition().duration(300).style("opacity", 0).remove();

    // ENTER: Point Groups
    const pointEnter = pointGroups
      .enter()
      .append("g")
      .attr("class", "data-point")
      .style("cursor", "pointer");

    // Add CVE point circles to each group (initially hidden)
    pointEnter
      .append("circle")
      .attr("class", "cve-point")
      .attr("r", 4)
      .attr("fill", primaryColor)
      .style("opacity", 0);

    // Add Advisory point circles to each group (initially hidden)
    pointEnter
      .append("circle")
      .attr("class", "advisory-point")
      .attr("r", 4)
      .attr("fill", errorColor)
      .style("opacity", 0);

    // Add hit areas for each new point group
    pointEnter.each(function (d: DataPoint) {
      const pointGroup = d3.select(this);

      // Add hit area for CVE point
      pointGroup
        .append("circle")
        .attr("class", "cve-hit-area")
        .attr("r", 15)
        .attr("fill", "transparent")
        .style("pointer-events", "all")
        .datum(d);

      // Add hit area for Advisory point
      pointGroup
        .append("circle")
        .attr("class", "advisory-hit-area")
        .attr("r", 15)
        .attr("fill", "transparent")
        .style("pointer-events", "all")
        .datum(d);
    });

    // UPDATE + ENTER - position all points with transition
    const allPoints = pointGroups.merge(pointEnter);

    // Update CVE points
    allPoints
      .select(".cve-point")
      .transition()
      .duration(750)
      .attr("cx", (d) => x(parseDate(d.timestamp)))
      .attr("cy", (d) => y(d.cves));

    // Update Advisory points
    allPoints
      .select(".advisory-point")
      .transition()
      .duration(750)
      .attr("cx", (d) => x(parseDate(d.timestamp)))
      .attr("cy", (d) => y(d.advisories));

    // Update hit area positions
    allPoints
      .select(".cve-hit-area")
      .attr("cx", (d) => x(parseDate(d.timestamp)))
      .attr("cy", (d) => y(d.cves));

    allPoints
      .select(".advisory-hit-area")
      .attr("cx", (d) => x(parseDate(d.timestamp)))
      .attr("cy", (d) => y(d.advisories));

    // Setup the interaction handlers
    const {
      handleMouseOver,
      handleMouseOut,
      handleChartMouseMove,
      handleChartMouseLeave,
    } = createDataPointHandlers(
      chartRef.current.tooltip!,
      chartRef.current.tooltipTitle!,
      chartRef.current.tooltipCVEs!,
      chartRef.current.tooltipAdvisories!,
      chartRef.current.hoverLine!,
      allPoints as unknown as d3.Selection<
        SVGGElement,
        DataPoint,
        null,
        undefined
      >,
      x,
      y,
      theme,
      data
    );

    // Apply event handlers to hit areas
    allPoints
      .select(".cve-hit-area")
      .on("mouseover", function (_, d) {
        handleMouseOver(d);
      })
      .on("mouseout", handleMouseOut);

    allPoints
      .select(".advisory-hit-area")
      .on("mouseover", function (_, d) {
        handleMouseOver(d);
      })
      .on("mouseout", handleMouseOut);

    // Add mouse tracking over the entire chart
    d3.select(svgRef.current)
      .on("mousemove", function (event) {
        handleChartMouseMove(event as MouseEvent, g, innerWidth);
      })
      .on("mouseleave", handleChartMouseLeave);
  }, [data, height, theme, svgRef]); // Update when data, height or theme changes

  // The data updates are handled in the main effect
};
