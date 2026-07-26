import type { TSeoActivitySummaryMetricId } from "@/lib/frontend/seo-activities/summary.utils";

/** Decorative sparkline shapes matched to the SEO summary chip mock (no time-series API yet). */
const SPARKLINE_SERIES: Record<TSeoActivitySummaryMetricId, readonly number[]> = {
  blogs: [0.32, 0.4, 0.36, 0.52, 0.46, 0.6, 0.55, 0.7, 0.64, 0.82, 0.74, 0.94],
  backlinks: [0.42, 0.55, 0.38, 0.58, 0.48, 0.62, 0.52, 0.68, 0.58, 0.72, 0.5, 0.9],
  technical_work: [0.22, 0.28, 0.34, 0.4, 0.46, 0.52, 0.58, 0.64, 0.7, 0.78, 0.84, 0.92],
  total: [0.38, 0.72, 0.32, 0.78, 0.42, 0.7, 0.48, 0.82, 0.36, 0.68, 0.52, 0.94],
};

/** Alternate phase — same point count so SVG path morphing stays smooth. */
const SPARKLINE_SERIES_ALT: Record<TSeoActivitySummaryMetricId, readonly number[]> = {
  blogs: [0.4, 0.34, 0.48, 0.42, 0.58, 0.5, 0.66, 0.6, 0.78, 0.7, 0.9, 0.82],
  backlinks: [0.5, 0.4, 0.58, 0.45, 0.62, 0.52, 0.7, 0.55, 0.74, 0.6, 0.86, 0.72],
  technical_work: [0.28, 0.34, 0.3, 0.44, 0.4, 0.56, 0.52, 0.68, 0.64, 0.8, 0.76, 0.9],
  total: [0.5, 0.35, 0.68, 0.42, 0.74, 0.48, 0.8, 0.4, 0.72, 0.55, 0.88, 0.62],
};

export type TSparklinePaths = {
  line: string;
  area: string;
  lineAlt: string;
  areaAlt: string;
};

function buildPoints(
  series: readonly number[],
  width: number,
  height: number,
): { x: number; y: number }[] {
  const padY = 3;
  const usableHeight = height - padY * 2;
  const step = width / Math.max(series.length - 1, 1);

  return series.map((value, index) => ({
    x: index * step,
    y: padY + (1 - value) * usableHeight,
  }));
}

function pointsToLinePath(points: { x: number; y: number }[]): string {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
}

function pointsToAreaPath(points: { x: number; y: number }[], height: number): string {
  const line = pointsToLinePath(points);
  const first = points[0]!;
  const last = points[points.length - 1]!;
  return `${line} L${last.x.toFixed(2)} ${height} L${first.x.toFixed(2)} ${height} Z`;
}

export function buildSeoActivitySparklinePaths(
  id: TSeoActivitySummaryMetricId,
  width = 88,
  height = 40,
): TSparklinePaths {
  const points = buildPoints(SPARKLINE_SERIES[id], width, height);
  const altPoints = buildPoints(SPARKLINE_SERIES_ALT[id], width, height);

  return {
    line: pointsToLinePath(points),
    area: pointsToAreaPath(points, height),
    lineAlt: pointsToLinePath(altPoints),
    areaAlt: pointsToAreaPath(altPoints, height),
  };
}
