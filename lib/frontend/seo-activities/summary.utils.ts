import type { TSeoActivityTypeCounts } from "@/types/seo-activity.types";

export type TSeoActivitySummaryMetricId =
  | "blogs"
  | "backlinks"
  | "web_changes"
  | "total";

export type TSeoActivitySummaryMetric = {
  id: TSeoActivitySummaryMetricId;
  value: number;
};

export type TSeoActivityRangeStats = {
  counts: TSeoActivityTypeCounts;
  metrics: TSeoActivitySummaryMetric[];
};

export function buildSeoActivityRangeStatsFromCounts(
  counts: TSeoActivityTypeCounts,
): TSeoActivityRangeStats {
  return {
    counts,
    metrics: [
      { id: "blogs", value: counts.blogs },
      { id: "backlinks", value: counts.backlinks },
      { id: "web_changes", value: counts.web_changes },
      { id: "total", value: counts.blogs + counts.backlinks + counts.web_changes },
    ],
  };
}
