"use client";

import { useEffect, useRef } from "react";

import { useQueryParams } from "@/hooks/use-query-params.hook";
import { parseAnalyticsPageQuery } from "@/lib/frontend/analytics/list-query.utils";
import type { TDateRange } from "@/lib/frontend/seo-activities/date-range.utils";
import { resolveAnalyticsDatePreset } from "@/lib/integrations/date.utils";

/**
 * URL `from` / `to` for Analytics and Dashboard home.
 * Defaults to last 30 days (UTC yesterday) and writes the range on first load.
 */
export function useSyncedAnalyticsDateRange() {
  const { queryParams, updateQueryParams } = useQueryParams();
  const pageQuery = parseAnalyticsPageQuery(queryParams);
  const dateRange = pageQuery.dateRange;
  const from = dateRange.from ?? "";
  const to = dateRange.to ?? "";
  const didSyncDefaultRange = useRef(false);

  useEffect(() => {
    if (didSyncDefaultRange.current) return;
    const hasFrom = typeof queryParams.from === "string" && queryParams.from.length > 0;
    const hasTo = typeof queryParams.to === "string" && queryParams.to.length > 0;
    if (hasFrom || hasTo) {
      didSyncDefaultRange.current = true;
      return;
    }
    if (!dateRange.from || !dateRange.to) return;
    didSyncDefaultRange.current = true;
    updateQueryParams({ from: dateRange.from, to: dateRange.to });
  }, [dateRange.from, dateRange.to, queryParams.from, queryParams.to, updateQueryParams]);

  function onDateRangeChange(range: TDateRange) {
    if (!range.from && !range.to) {
      const fallback = resolveAnalyticsDatePreset("last_30_days");
      updateQueryParams({
        from: fallback.from ?? "",
        to: fallback.to ?? "",
      });
      return;
    }

    const next: Record<string, string> = {};
    if (range.from) next.from = range.from;
    if (range.to) next.to = range.to;
    updateQueryParams(next);
  }

  return {
    dateRange,
    from,
    to,
    hasRange: Boolean(from && to),
    onDateRangeChange,
  };
}
