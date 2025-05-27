import { useEffect, RefObject } from "react";
import * as d3 from "d3";
import { Theme } from "@mui/material";
import { DataPoint } from "../types";
import { parseDate } from "../utils/formatDate";
import { createDataPointHandlers } from "../utils/interactionHandlers";

/**
 * Hook for rendering the Time Series chart using D3
 */
export const useTimeSeriesD3 = (
  svgRef: RefObject<SVGSVGElement>,
  data: DataPoint[],
  height: number,
  theme: Theme
) => {
  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous chart

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

    // Create scales
    const x = d3
      .scaleTime()
      .domain(d3.extent(data, d => parseDate(d.timestamp)) as [Date, Date])
      .range([0, innerWidth]);

    const yMax = d3.max(data, d => Math.max(d.cves, d.advisories)) ?? 0;
    const y = d3
      .scaleLinear()
      .domain([0, yMax * 1.1])
      .nice()
      .range([innerHeight, 0]);

    // Line generators
    const lineCves = d3
      .line<DataPoint>()
      .x(d => x(parseDate(d.timestamp)))
      .y(d => y(d.cves))
      .curve(d3.curveMonotoneX);

    const lineAdvisories = d3
      .line<DataPoint>()
      .x(d => x(parseDate(d.timestamp)))
      .y(d => y(d.advisories))
      .curve(d3.curveMonotoneX);

    // Set up the SVG and main group
    const g = svg
      .attr("viewBox", `0 0 ${width} ${adjustedHeight}`)
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
      .attr("y1", d => y(d))
      .attr("y2", d => y(d))
      .attr("stroke", theme.palette.divider)
      .attr("stroke-width", 0.5)
      .attr("stroke-dasharray", "3,3");

    // Add X-axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(isMobile ? 4 : 6).tickSizeOuter(0))
      .attr("color", axisColor)
      .attr("font-size", isMobile ? "10px" : "12px")
      .append("text")
      .attr("fill", axisColor)
      .attr("text-anchor", "middle")
      .attr("x", innerWidth / 2)
      .attr("y", 30)
      .text("Date");

    // Add Y-axis
    g.append("g")
      .call(d3.axisLeft(y).ticks(6))
      .attr("color", axisColor)
      .attr("font-size", isMobile ? "10px" : "12px")
      .append("text")
      .attr("fill", axisColor)
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -35)
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

    // Draw the CVE line with animation
    const cveLine = g
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", primaryColor)
      .attr("stroke-width", 2)
      .attr("d", lineCves);

    // Animate CVE path
    const cvePathLength = cveLine.node()?.getTotalLength() || 0;
    cveLine
      .attr("stroke-dasharray", cvePathLength)
      .attr("stroke-dashoffset", cvePathLength)
      .transition()
      .duration(1000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);

    // Draw the Advisory line with animation
    const advisoryLine = g
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", errorColor)
      .attr("stroke-width", 2)
      .attr("d", lineAdvisories);

    // Animate Advisory path
    const advisoryPathLength = advisoryLine.node()?.getTotalLength() || 0;
    advisoryLine
      .attr("stroke-dasharray", advisoryPathLength)
      .attr("stroke-dashoffset", advisoryPathLength)
      .transition()
      .duration(1000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);

    // Create tooltip
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
      .attr("stroke-width", 1.5)
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

    // Create data points
    const points = g
      .selectAll(".data-point")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "data-point")
      .style("cursor", "pointer");

    // Add CVE data points with animation
    points
      .append("circle")
      .attr("cx", (d: DataPoint) => x(parseDate(d.timestamp)))
      .attr("cy", (d: DataPoint) => y(d.cves))
      .attr("r", 0)
      .attr("fill", primaryColor)
      .transition()
      .delay((_, i) => i * 100)
      .duration(500)
      .attr("r", 4);

    // Add Advisory data points with animation
    points
      .append("circle")
      .attr("cx", (d: DataPoint) => x(parseDate(d.timestamp)))
      .attr("cy", (d: DataPoint) => y(d.advisories))
      .attr("r", 0)
      .attr("fill", errorColor)
      .transition()
      .delay((_, i) => i * 100)
      .duration(500)
      .attr("r", 4);

    // Setup the interaction handlers
    const {
      handleMouseOver,
      handleMouseOut,
      handleChartMouseMove,
      handleChartMouseLeave
    } = createDataPointHandlers(
      tooltip,
      tooltipTitle,
      tooltipCVEs,
      tooltipAdvisories,
      hoverLine,
      points as unknown as d3.Selection<SVGGElement, DataPoint, null, undefined>,
      x,
      y,
      theme
    );

    // Add interactive hit areas for each data point
    points.each(function(d: DataPoint) {
      const pointGroup = d3.select(this);

      // Add hit area for CVE point
      pointGroup
        .append("circle")
        .attr("cx", () => x(parseDate(d.timestamp)))
        .attr("cy", () => y(d.cves))
        .attr("r", 15)
        .attr("fill", "transparent")
        .attr("class", "hit-area")
        .style("pointer-events", "all")
        .datum(d)
        .on("mouseover", function(event, dataPoint) {
          handleMouseOver(event as MouseEvent, dataPoint);
        })
        .on("mouseout", handleMouseOut);

      // Add hit area for Advisory point
      pointGroup
        .append("circle")
        .attr("cx", () => x(parseDate(d.timestamp)))
        .attr("cy", () => y(d.advisories))
        .attr("r", 15)
        .attr("fill", "transparent")
        .attr("class", "hit-area")
        .style("pointer-events", "all")
        .datum(d)
        .on("mouseover", function(event, dataPoint) {
          handleMouseOver(event as MouseEvent, dataPoint);
        })
        .on("mouseout", handleMouseOut);
    });

    // Add mouse tracking over the entire chart
    d3.select(svgRef.current)
      .on("mousemove", function(event) {
        handleChartMouseMove(event as MouseEvent, g, innerWidth);
      })
      .on("mouseleave", handleChartMouseLeave);

  }, [data, height, theme, svgRef]);
};
