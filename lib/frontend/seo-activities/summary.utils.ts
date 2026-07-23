import {
  DUMMY_SEO_ACTIVITY_BACKLINKS,
  DUMMY_SEO_ACTIVITY_BLOGS,
  DUMMY_SEO_ACTIVITY_WEB_CHANGES,
} from "@/lib/frontend/seo-activities/dummy-data";
import {
  isDateInRange,
  type TDateRange,
} from "@/lib/frontend/seo-activities/date-range.utils";
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

export function buildSeoActivityRangeStats(range: TDateRange): TSeoActivityRangeStats {
  const blogs = DUMMY_SEO_ACTIVITY_BLOGS.filter((row) => isDateInRange(row.occurredOn, range)).length;
  const backlinks = DUMMY_SEO_ACTIVITY_BACKLINKS.filter((row) =>
    isDateInRange(row.occurredOn, range),
  ).length;
  const web_changes = DUMMY_SEO_ACTIVITY_WEB_CHANGES.filter((row) =>
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
