import type { TDateRangePresetId } from "@/lib/frontend/seo-activities/date-range.utils";
import { resolveDateRangePreset } from "@/lib/frontend/seo-activities/date-range.utils";
import { ANALYTICS_MAX_RANGE_DAYS } from "@/lib/integrations/constants";
import {
  addUtcDays,
  inclusiveDaySpan,
  resolveAnalyticsDatePreset,
  toUtcDateString,
  utcYesterdayString,
} from "@/lib/integrations/date.utils";
import type { TAssistantWindowSpec } from "@/types/assistant.types";

export type TResolvedAssistantRange = {
  from: string | null;
  to: string | null;
  label: string;
};

const PRESET_LABELS: Record<TDateRangePresetId, string> = {
  all: "all time",
  last_15_days: "the last 15 days",
  last_30_days: "the last 30 days",
  last_90_days: "the last 90 days",
  last_month: "last month",
  this_month: "this month",
  last_year: "last year",
  this_year: "this year",
};

function lastNDaysLabel(days: number): string {
  return days === 1 ? "the last day" : `the last ${days} days`;
}

function localTodayIso(now: Date): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addLocalDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year!, month! - 1, day! + days);
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
  const nextDay = String(date.getDate()).padStart(2, "0");
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

function clampAnalyticsRange(from: string, to: string): { from: string; to: string } {
  if (inclusiveDaySpan(from, to) <= ANALYTICS_MAX_RANGE_DAYS) {
    return { from, to };
  }
  return { from: addUtcDays(to, -(ANALYTICS_MAX_RANGE_DAYS - 1)), to };
}

function analyticsYearRange(
  preset: "this_year" | "last_year",
  now: Date,
): { from: string; to: string } {
  const yesterday = utcYesterdayString(now);
  if (preset === "this_year") {
    const from = toUtcDateString(new Date(Date.UTC(now.getUTCFullYear(), 0, 1)));
    return clampAnalyticsRange(from, yesterday);
  }
  const year = now.getUTCFullYear() - 1;
  const from = toUtcDateString(new Date(Date.UTC(year, 0, 1)));
  const to = toUtcDateString(new Date(Date.UTC(year, 11, 31)));
  return clampAnalyticsRange(from, to);
}

function analyticsAllRange(now: Date): { from: string; to: string } {
  const to = utcYesterdayString(now);
  return { from: addUtcDays(to, -(ANALYTICS_MAX_RANGE_DAYS - 1)), to };
}

export function resolveLeadsSeoWindow(
  spec: TAssistantWindowSpec,
  fallback: "this_month" | "all",
  now = new Date(),
): TResolvedAssistantRange {
  if (spec.lastNDays != null && spec.lastNDays > 0) {
    const to = localTodayIso(now);
    const from = addLocalDays(to, -(spec.lastNDays - 1));
    return { from, to, label: lastNDaysLabel(spec.lastNDays) };
  }

  const preset = spec.preset ?? fallback;
  if (preset === "all") {
    return { from: null, to: null, label: PRESET_LABELS.all };
  }

  const range = resolveDateRangePreset(preset, now);
  return {
    from: range.from,
    to: range.to,
    label: PRESET_LABELS[preset],
  };
}

export function resolveAnalyticsWindow(
  spec: TAssistantWindowSpec,
  now = new Date(),
): TResolvedAssistantRange {
  const yesterday = utcYesterdayString(now);

  if (spec.lastNDays != null && spec.lastNDays > 0) {
    const unclampedFrom = addUtcDays(yesterday, -(spec.lastNDays - 1));
    const range = clampAnalyticsRange(unclampedFrom, yesterday);
    const span = inclusiveDaySpan(range.from, range.to);
    return { from: range.from, to: range.to, label: lastNDaysLabel(span) };
  }

  const preset = spec.preset ?? "last_30_days";

  if (preset === "all") {
    const range = analyticsAllRange(now);
    return {
      from: range.from,
      to: range.to,
      label: lastNDaysLabel(ANALYTICS_MAX_RANGE_DAYS),
    };
  }

  if (preset === "this_year" || preset === "last_year") {
    const range = analyticsYearRange(preset, now);
    return { from: range.from, to: range.to, label: PRESET_LABELS[preset] };
  }

  const range = resolveAnalyticsDatePreset(preset, now);
  if (!range.from || !range.to) {
    const fallback = resolveAnalyticsDatePreset("last_30_days", now);
    return {
      from: fallback.from!,
      to: fallback.to!,
      label: PRESET_LABELS.last_30_days,
    };
  }

  return { from: range.from, to: range.to, label: PRESET_LABELS[preset] };
}

export function rangeQuery(from: string | null, to: string | null): string {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
