import * as d3 from "d3";
import { Theme } from "@mui/material";
import { DataPoint } from "./types";
import { formatDate, parseDate } from "./formatDate";

/**
 * Create handlers for mouse interactions with data points
 */
export const createDataPointHandlers = (
  tooltip: d3.Selection<SVGGElement, unknown, null, undefined>,
  tooltipTitle: d3.Selection<SVGTextElement, unknown, null, undefined>,
  tooltipCVEs: d3.Selection<SVGTextElement, unknown, null, undefined>,
  tooltipAdvisories: d3.Selection<SVGTextElement, unknown, null, undefined>,
  hoverLine: d3.Selection<SVGLineElement, unknown, null, undefined>,
  points: d3.Selection<SVGGElement, DataPoint, null, undefined>,
  x: d3.ScaleTime<number, number>,
  y: d3.ScaleLinear<number, number>,
  theme: Theme,
  data: DataPoint[]
) => {
  // Ensure data is sorted by timestamp ascending for bisector accuracy
  const sortedData = [...data].sort(
    (a, b) =>
      parseDate(a.timestamp).getTime() - parseDate(b.timestamp).getTime()
  );

  /**
   * Handle mouseover on data points
   */
  const handleMouseOver = function (dataPoint: DataPoint): void {
    const xPos = x(parseDate(dataPoint.timestamp));
    const minYValue = Math.min(y(dataPoint.cves), y(dataPoint.advisories));
    const yPos = minYValue < 100 ? minYValue + 30 : minYValue - 90;

    // Ensure tooltip stays inside chart bounds
    const tooltipWidth = 160; // matches rect width
    const padding = 10;
    const chartWidth = x.range()[1];

    let tooltipX: number;
    if (xPos < tooltipWidth + padding) {
      // Too close to left edge – place tooltip to right of cursor
      tooltipX = xPos + padding;
    } else if (xPos > chartWidth - tooltipWidth - padding) {
      // Too close to right edge – place tooltip to left of cursor
      tooltipX = xPos - tooltipWidth - padding;
    } else {
      // Centered (default)
      tooltipX = xPos - tooltipWidth / 2;
    }

    tooltip
      .style("opacity", 1)
      .attr("transform", `translate(${tooltipX},${yPos})`);

    tooltipTitle.text(formatDate(dataPoint.timestamp));
    tooltipCVEs.text(`CVEs: ${dataPoint.cves}`);
    tooltipAdvisories.text(`Advisories: ${dataPoint.advisories}`);

    hoverLine.attr("x1", xPos).attr("x2", xPos).style("opacity", 1);

    // Highlight the data point
    points
      .selectAll<SVGCircleElement, DataPoint>("circle:not(.hit-area)")
      .each(function (p: DataPoint) {
        const element = d3.select(this);
        if (p.timestamp === dataPoint.timestamp) {
          element
            .style("opacity", 1)
            .attr("r", 6)
            .attr("stroke", theme.palette.background.paper)
            .attr("stroke-width", 2);
        } else {
          element
            .style("opacity", 0)
            .attr("r", 4)
            .attr("stroke", "none")
            .attr("stroke-width", 0);
        }
      });
  };

  /**
   * Handle mouseout from data points
   */
  const handleMouseOut = function () {
    setTimeout(() => {
      tooltip.style("opacity", 0);
      hoverLine.style("opacity", 0);

      points
        .selectAll<SVGCircleElement, DataPoint>("circle:not(.hit-area)")
        .style("opacity", 0)
        .attr("r", 4)
        .attr("stroke", "none")
        .attr("stroke-width", 0);
    }, 200);
  };

  /**
   * Handle mouse movement over the chart area
   */
  const handleChartMouseMove = function (
    event: MouseEvent,
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    innerWidth: number
  ) {
    const gElement = g.node();
    if (!gElement) return;
    const [mouseX] = d3.pointer(event, gElement);
    const chartX = mouseX; // already relative to chart's inner area

    // If outside of bounds, hide line & tooltip
    if (chartX < 0 || chartX > innerWidth) {
      hoverLine.style("opacity", 0);
      tooltip.style("opacity", 0);
      return;
    }

    // Position hover line at the current cursor X position
    hoverLine.attr("x1", chartX).attr("x2", chartX).style("opacity", 1);

    // Find closest data point to current X position
    const dataPoints: DataPoint[] = sortedData;
    if (!dataPoints.length) return;

    const hoveredDate = x.invert(chartX);
    const bisect = d3.bisector<DataPoint, Date>((d) =>
      parseDate(d.timestamp)
    ).left;
    let index = bisect(dataPoints, hoveredDate, 1);

    // Clamp index to valid range
    if (index <= 0) index = 1;
    if (index >= dataPoints.length) index = dataPoints.length - 1;

    const leftPoint = dataPoints[index - 1];
    const rightPoint = dataPoints[index];

    const closestPoint =
      hoveredDate.getTime() - parseDate(leftPoint.timestamp).getTime() >
      parseDate(rightPoint.timestamp).getTime() - hoveredDate.getTime()
        ? rightPoint
        : leftPoint;

    // Update tooltip/highlight via shared handler
    handleMouseOver(closestPoint);
  };

  /**
   * Handle mouse leaving the chart area
   */
  const handleChartMouseLeave = function () {
    hoverLine.style("opacity", 0);
    tooltip.style("opacity", 0);

    // Reset points
    points
      .selectAll<SVGCircleElement, DataPoint>("circle:not(.hit-area)")
      .style("opacity", 0)
      .attr("r", 4)
      .attr("stroke", "none")
      .attr("stroke-width", 0);
  };

  return {
    handleMouseOver,
    handleMouseOut,
    handleChartMouseMove,
    handleChartMouseLeave,
  };
};
