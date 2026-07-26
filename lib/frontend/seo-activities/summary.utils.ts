import {
  isDateInRange,
  type TDateRange,
} from "@/lib/frontend/seo-activities/date-range.utils";
import type { TSeoActivityCollections } from "@/lib/frontend/seo-activities/quick-add.utils";
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

export function buildSeoActivityRangeStats(
  range: TDateRange,
  collections: TSeoActivityCollections,
): TSeoActivityRangeStats {
  const blogs = collections.blogs.filter((row) => isDateInRange(row.occurredOn, range)).length;
  const backlinks = collections.backlinks.filter((row) => isDateInRange(row.occurredOn, range)).length;
  const web_changes = collections.web_changes.filter((row) =>
    isDateInRange(row.occurredOn, range),
  ).length;

  const counts = { blogs, backlinks, web_changes };

  return {
    counts,
    metrics: [
      { id: "blogs", value: blogs },
      { id: "backlinks", value: backlinks },
      { id: "web_changes", value: web_changes },
      { id: "total", value: blogs + backlinks + web_changes },
    ],
  };
}
