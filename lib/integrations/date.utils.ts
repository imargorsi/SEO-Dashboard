/** Format a Date as `YYYY-MM-DD` in UTC. */
export function toUtcDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Parse `YYYY-MM-DD` as UTC midnight. */
export function parseUtcDateString(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/** Yesterday in UTC as `YYYY-MM-DD` (GSC/GA data for "today" is incomplete). */
export function utcYesterdayString(now = new Date()): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  d.setUTCDate(d.getUTCDate() - 1);
  return toUtcDateString(d);
}

export function addUtcDays(dateString: string, days: number): string {
  const d = parseUtcDateString(dateString);
  d.setUTCDate(d.getUTCDate() + days);
  return toUtcDateString(d);
}

/** Inclusive list of `YYYY-MM-DD` strings from `from` through `to` (UTC). */
export function enumerateUtcDateRange(from: string, to: string): string[] {
  if (from > to) return [];
  const dates: string[] = [];
  let cursor = from;
  while (cursor <= to) {
    dates.push(cursor);
    cursor = addUtcDays(cursor, 1);
  }
  return dates;
}

export function defaultAnalyticsDateRange(now = new Date()): { from: string; to: string } {
  const to = utcYesterdayString(now);
  const from = addUtcDays(to, -29);
  return { from, to };
}

/** Inclusive day count between two `YYYY-MM-DD` strings (UTC). */
export function inclusiveDaySpan(from: string, to: string): number {
  const start = parseUtcDateString(from).getTime();
  const end = parseUtcDateString(to).getTime();
  return Math.floor((end - start) / 86_400_000) + 1;
}

// ─── Analytics date range presets (end = UTC yesterday) ────────────────────

import type { TDateRange, TDateRangePresetId } from "@/lib/frontend/seo-activities/date-range.utils";

export const ANALYTICS_DATE_PRESET_IDS: readonly TDateRangePresetId[] = [
  "last_15_days",
  "last_30_days",
  "this_month",
  "last_month",
  "last_90_days",
] as const;

export function resolveAnalyticsDatePreset(
  preset: TDateRangePresetId,
  now = new Date(),
): TDateRange {
  const yesterday = utcYesterdayString(now);

  switch (preset) {
    case "last_15_days":
      return { from: addUtcDays(yesterday, -14), to: yesterday };
    case "last_30_days":
      return { from: addUtcDays(yesterday, -29), to: yesterday };
    case "last_90_days":
      return { from: addUtcDays(yesterday, -89), to: yesterday };
    case "last_month": {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
      const start = toUtcDateString(d);
      const end = toUtcDateString(
        new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0)),
      );
      return { from: start, to: end };
    }
    case "this_month": {
      const start = toUtcDateString(
        new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
      );
      return { from: start, to: yesterday };
    }
    case "all":
    default:
      return { from: addUtcDays(yesterday, -29), to: yesterday };
  }
}

export function matchAnalyticsDatePreset(
  range: TDateRange,
  now = new Date(),
): TDateRangePresetId | null {
  for (const preset of ANALYTICS_DATE_PRESET_IDS) {
    const resolved = resolveAnalyticsDatePreset(preset, now);
    if (resolved.from === range.from && resolved.to === range.to) {
      return preset;
    }
  }
  return null;
}
