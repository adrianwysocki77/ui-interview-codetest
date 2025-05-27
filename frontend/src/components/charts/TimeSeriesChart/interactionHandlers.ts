import * as d3 from "d3";
import { Theme } from "@mui/material";
import { DataPoint } from "./types";
import { formatDate } from "./formatDate";

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
  theme: Theme
) => {
  /**
   * Handle mouseover on data points
   */
  const handleMouseOver = function (_: MouseEvent, dataPoint: DataPoint) {
    const xPos = x(new Date(dataPoint.timestamp));
    const minYValue = Math.min(y(dataPoint.cves), y(dataPoint.advisories));
    const yPos = minYValue < 100 ? minYValue + 30 : minYValue - 90;

    tooltip
      .style("opacity", 1)
      .attr("transform", `translate(${xPos - 80},${yPos})`);

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
            .attr("r", 6)
            .attr("stroke", theme.palette.background.paper)
            .attr("stroke-width", 2);
        } else {
          element.attr("r", 4).attr("stroke", "none").attr("stroke-width", 0);
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
    }, 300);

    setTimeout(() => {
      points
        .selectAll<SVGCircleElement, DataPoint>("circle:not(.hit-area)")
        .attr("r", 4)
        .attr("stroke", "none")
        .attr("stroke-width", 0);
    }, 300);
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

    if (chartX < 0 || chartX > innerWidth) {
      hoverLine.style("opacity", 0);
      return;
    }

    // Always position hover line based on direct mouse position
    hoverLine.attr("x1", chartX).attr("x2", chartX).style("opacity", 1);
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
