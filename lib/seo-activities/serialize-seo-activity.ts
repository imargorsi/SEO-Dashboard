import type { SeoActivityDocument } from "@/models/SeoActivity";
import type {
  TSeoActivityBacklink,
  TSeoActivityBlog,
  TSeoActivityRow,
  TSeoActivityType,
  TSeoActivityWebChange,
} from "@/types/seo-activity.types";

function formatOccurredOn(doc: SeoActivityDocument): string | null {
  if (doc.occurredOn) {
    return doc.occurredOn.toISOString().slice(0, 10);
  }
  return doc.occurredOnRaw;
}

export function serializeSeoActivity(doc: SeoActivityDocument): TSeoActivityRow {
  const base = {
    id: doc._id.toString(),
    site: doc.siteCode,
    occurredOn: formatOccurredOn(doc),
  };

  if (doc.activityType === "blogs") {
    const row: TSeoActivityBlog = {
      ...base,
      title: doc.title,
      url: doc.url,
    };
    return row;
  }

  if (doc.activityType === "backlinks") {
    const row: TSeoActivityBacklink = {
      ...base,
      url: doc.url,
      anchorText: doc.anchorText,
    };
    return row;
  }

  const row: TSeoActivityWebChange = {
    ...base,
    url: doc.url,
    details: doc.details,
  };
  return row;
}

export function emptyCounts(): Record<TSeoActivityType, number> {
  return {
    blogs: 0,
    backlinks: 0,
    web_changes: 0,
  };
}
