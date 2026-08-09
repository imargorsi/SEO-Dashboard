import {
  isValidIsoDate,
  normalizeDateRange,
  resolveDateRangePreset,
  type TDateRange,
} from "@/lib/frontend/seo-activities/date-range.utils";
import { LEAD_DEFAULT_PER_PAGE } from "@/lib/leads/constants";

type TQueryValue = string | string[] | undefined;

export type TLeadsListQuery = {
  page: number;
  perPage: number;
  dateRange: TDateRange;
  q: string | null;
};

function firstValue(value: TQueryValue): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseLeadsListQuery(params: Record<string, TQueryValue>): TLeadsListQuery {
  const pageRaw = Number(firstValue(params.page) ?? "1");
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const fromRaw = firstValue(params.from)?.trim() ?? null;
  const toRaw = firstValue(params.to)?.trim() ?? null;
  const rangeRaw = firstValue(params.range)?.trim().toLowerCase() ?? null;
  const qRaw = firstValue(params.q)?.trim() ?? null;
  const from = isValidIsoDate(fromRaw) ? fromRaw : null;
  const to = isValidIsoDate(toRaw) ? toRaw : null;

  let dateRange: TDateRange;
  if (from || to) {
    dateRange = normalizeDateRange({ from, to });
  } else if (rangeRaw === "all") {
    dateRange = resolveDateRangePreset("all");
  } else {
    dateRange = resolveDateRangePreset("last_30_days");
  }

  return {
    page,
    perPage: LEAD_DEFAULT_PER_PAGE,
    dateRange,
    q: qRaw && qRaw.length > 0 ? qRaw : null,
  };
}
