export type TSparklinePaths = {
  line: string;
  area: string;
  /** Last point — for the glowing trend pointer. */
  end: { x: number; y: number };
};

function buildPoints(
  series: readonly number[],
  width: number,
  height: number,
): { x: number; y: number }[] {
  const padX = 4;
  const padY = 8;
  const usableWidth = width - padX * 2;
  const usableHeight = height - padY * 2;
  const step = usableWidth / Math.max(series.length - 1, 1);
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;

  return series.map((value, index) => {
    const normalized = (value - min) / span;
    return {
      x: padX + index * step,
      y: padY + (1 - normalized) * usableHeight,
    };
  });
}

/** Smooth cubic path through points (Catmull-Rom → Bezier). */
function pointsToSmoothLinePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) {
    const p = points[0]!;
    return `M${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
  }

  let d = `M${points[0]!.x.toFixed(2)} ${points[0]!.y.toFixed(2)}`;

  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[i + 2] ?? p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  return d;
}

function pointsToAreaPath(linePath: string, points: { x: number; y: number }[], height: number): string {
  const first = points[0]!;
  const last = points[points.length - 1]!;
  return `${linePath} L${last.x.toFixed(2)} ${height} L${first.x.toFixed(2)} ${height} Z`;
}

/**
 * Build smooth line + area from values.
 * If `forceEndHigh` is set, bias the visual end for clear up/down pointer (when series is flat/short).
 */
export function buildSparklinePathsFromValues(
  values: readonly number[],
  width = 280,
  height = 64,
  options?: { preferRising?: boolean | null },
): TSparklinePaths | null {
  let series = [...values];
  if (series.length === 0) {
    // Decorative fallback shaped by trend preference.
    series =
      options?.preferRising === false
        ? [0.75, 0.7, 0.78, 0.55, 0.62, 0.4, 0.48, 0.28]
        : [0.25, 0.32, 0.28, 0.45, 0.4, 0.58, 0.52, 0.78];
  } else if (series.length === 1) {
    const v = series[0]!;
    series = [v * 0.85, v * 0.9, v, v * 1.05, v];
  }

  // Ensure pointer direction matches trend badge when we have a clear preference.
  if (options?.preferRising === true && series[series.length - 1]! <= series[0]!) {
    series = series.map((v, i) => v + (i / (series.length - 1)) * (Math.max(...series) - Math.min(...series) + 0.01));
  }
  if (options?.preferRising === false && series[series.length - 1]! >= series[0]!) {
    series = series.map((v, i) => v - (i / (series.length - 1)) * (Math.max(...series) - Math.min(...series) + 0.01));
  }

  const points = buildPoints(series, width, height);
  const line = pointsToSmoothLinePath(points);
  return {
    line,
    area: pointsToAreaPath(line, points, height),
    end: points[points.length - 1]!,
  };
}
