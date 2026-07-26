import type { TSeoActivityTypeCounts } from "@/types/seo-activity.types";

export type TSeoActivitySummaryMetricId =
  | "blogs"
  | "backlinks"
  | "technical_work"
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
      { id: "technical_work", value: counts.technical_work },
      { id: "total", value: counts.blogs + counts.backlinks + counts.technical_work },
    ],
  };
}
