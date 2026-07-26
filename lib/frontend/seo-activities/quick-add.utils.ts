import { isValidIsoDate } from "@/lib/frontend/seo-activities/date-range.utils";
import { sanitizeHttpUrl } from "@/lib/frontend/seo-activities/sanitize-url.utils";
import type {
  TSeoActivityBacklink,
  TSeoActivityBlog,
  TSeoActivityType,
  TSeoActivityWebChange,
} from "@/types/seo-activity.types";

export type TSeoActivityCollections = {
  blogs: TSeoActivityBlog[];
  backlinks: TSeoActivityBacklink[];
  web_changes: TSeoActivityWebChange[];
};

export type TSeoActivityQuickAddValues = {
  title: string;
  url: string;
  anchorText: string;
  details: string;
  occurredOn: string;
};

export function todayIsoDate(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createSeoActivityId(type: TSeoActivityType): string {
  const prefix = type === "blogs" ? "blog" : type === "backlinks" ? "bl" : "wc";
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyQuickAddValues(now = new Date()): TSeoActivityQuickAddValues {
  return {
    title: "",
    url: "",
    anchorText: "",
    details: "",
    occurredOn: todayIsoDate(now),
  };
}

export function buildSeoActivityFromQuickAdd(
  type: TSeoActivityType,
  values: TSeoActivityQuickAddValues,
): TSeoActivityBlog | TSeoActivityBacklink | TSeoActivityWebChange {
  const occurredOn = isValidIsoDate(values.occurredOn.trim()) ? values.occurredOn.trim() : todayIsoDate();
  const url = sanitizeHttpUrl(values.url);
  const id = createSeoActivityId(type);

  if (type === "blogs") {
    return {
      id,
      title: values.title.trim() || null,
      url,
      occurredOn,
    };
  }

  if (type === "backlinks") {
    return {
      id,
      anchorText: values.anchorText.trim() || null,
      url,
      occurredOn,
    };
  }

  return {
    id,
    details: values.details.trim() || null,
    url,
    occurredOn,
  };
}
