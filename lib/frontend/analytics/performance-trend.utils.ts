import {
  enumerateUtcDateRange,
  inclusiveDaySpan,
  parseUtcDateString,
} from "@/lib/integrations/date.utils";
import type { TAnalyticsOverviewDto } from "@/types/analytics.types";

export const ANALYTICS_TREND_METRICS = [
  "clicks",
  "impressions",
  "ctr",
  "position",
] as const;

export type TAnalyticsTrendMetric = (typeof ANALYTICS_TREND_METRICS)[number];

export type TAnalyticsTrendPoint = {
  date: string;
  /** Display value for the active metric (CTR as percent 0–100). */
  value: number;
  /** Raw API value (CTR as 0–1 ratio). Null when that day had no GSC row. */
  raw: number | null;
  /** Day-over-day percent change. Position: positive = improved (lower rank). */
  changePercent: number | null;
};

function toDisplayValue(metric: TAnalyticsTrendMetric, raw: number | null): number {
  if (raw == null || Number.isNaN(raw)) return 0;
  if (metric === "ctr") return raw * 100;
  return raw;
}

function dayOverDayChange(
  metric: TAnalyticsTrendMetric,
  current: number | null,
  previous: number | null,
): number | null {
  if (current == null || previous == null) return null;
  if (previous === 0) return current === 0 ? 0 : null;
  if (metric === "position") {
    return ((previous - current) / Math.abs(previous)) * 100;
  }
  return ((current - previous) / Math.abs(previous)) * 100;
}

/** Build a continuous daily series for the selected GSC metric (date-filter window). */
export function buildAnalyticsTrendPoints(
  series: TAnalyticsOverviewDto["series"],
  from: string,
  to: string,
  metric: TAnalyticsTrendMetric,
): TAnalyticsTrendPoint[] {
  if (!from || !to || from > to) return [];

  const byDate = new Map(series.map((row) => [row.date, row]));
  const dates = enumerateUtcDateRange(from, to);
  const points: TAnalyticsTrendPoint[] = [];

  for (let index = 0; index < dates.length; index += 1) {
    const date = dates[index]!;
    const row = byDate.get(date);
    const raw = row?.[metric] ?? null;
    const previousRaw =
      index > 0 ? (byDate.get(dates[index - 1]!)?.[metric] ?? null) : null;

    points.push({
      date,
      value: toDisplayValue(metric, raw),
      raw,
      changePercent: dayOverDayChange(metric, raw, previousRaw),
    });
  }

  return points;
}

export function formatTrendAxisLabel(
  date: string,
  from: string,
  to: string,
  monthLabels: readonly string[],
): string {
  const span = inclusiveDaySpan(from, to);
  const d = parseUtcDateString(date);
  const month = monthLabels[d.getUTCMonth()] ?? "";

  if (span > 60) {
    return month.slice(0, 3).toUpperCase();
  }

  if (span > 14) {
    return `${month.slice(0, 3)} ${d.getUTCDate()}`;
  }

  return String(d.getUTCDate());
}

export function formatTrendTooltipDate(
  date: string,
  monthLabels: readonly string[],
): string {
  const d = parseUtcDateString(date);
  const month = monthLabels[d.getUTCMonth()] ?? "";
  return `${month} ${d.getUTCDate()}`.toUpperCase();
}

export function formatTrendMetricValue(
  metric: TAnalyticsTrendMetric,
  value: number | null,
): string {
  if (value == null || Number.isNaN(value)) return "—";
  if (metric === "ctr") {
    return `${value.toFixed(1)}%`;
  }
  if (metric === "position") {
    return value.toFixed(1);
  }
  return new Intl.NumberFormat(undefined, {
    notation: value >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: value >= 10_000 ? 1 : 0,
  }).format(value);
}

/** Tick indices to avoid crowding the X axis. */
export function pickTrendTickIndexes(length: number): number[] {
  if (length <= 1) return length === 1 ? [0] : [];
  if (length <= 8) return Array.from({ length }, (_, i) => i);

  const target = length > 60 ? 6 : 8;
  const step = Math.max(1, Math.floor((length - 1) / (target - 1)));
  const indexes = new Set<number>([0, length - 1]);
  for (let i = step; i < length - 1; i += step) {
    indexes.add(i);
  }
  return [...indexes].sort((a, b) => a - b);
}
