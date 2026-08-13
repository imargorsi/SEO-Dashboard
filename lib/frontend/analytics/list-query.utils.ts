import {
  isValidIsoDate,
  normalizeDateRange,
  type TDateRange,
} from "@/lib/frontend/seo-activities/date-range.utils";
import { resolveAnalyticsDatePreset } from "@/lib/integrations/date.utils";

type TQueryValue = string | string[] | undefined;

export type TAnalyticsPageQuery = {
  dateRange: TDateRange;
};

function firstValue(value: TQueryValue): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

/** Read Analytics / Dashboard date window from URL (`from` / `to`). Defaults to last 30 days. */
export function parseAnalyticsPageQuery(
  params: Record<string, TQueryValue>,
): TAnalyticsPageQuery {
  const fromRaw = firstValue(params.from)?.trim() ?? null;
  const toRaw = firstValue(params.to)?.trim() ?? null;
  const from = isValidIsoDate(fromRaw) ? fromRaw : null;
  const to = isValidIsoDate(toRaw) ? toRaw : null;

  if (from || to) {
    const normalized = normalizeDateRange({ from, to });
    if (normalized.from && normalized.to) {
      return { dateRange: normalized };
    }
    if (normalized.from && !normalized.to) {
      return { dateRange: { from: normalized.from, to: normalized.from } };
    }
    if (!normalized.from && normalized.to) {
      return { dateRange: { from: normalized.to, to: normalized.to } };
    }
  }

  return { dateRange: resolveAnalyticsDatePreset("last_30_days") };
}
