import type { TSeoActivityType } from "@/types/seo-activity.types";

export const SEO_ACTIVITY_DEFAULT_TYPE: TSeoActivityType = "blogs";

export const SEO_ACTIVITY_PER_PAGE = 6;

export const SEO_ACTIVITY_TYPE_OPTIONS: readonly TSeoActivityType[] = [
  "blogs",
  "backlinks",
  "web_changes",
] as const;
