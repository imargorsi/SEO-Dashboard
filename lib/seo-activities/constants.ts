import type { TSeoActivityType } from "@/types/seo-activity.types";

export const SEO_ACTIVITY_TYPES = ["blogs", "backlinks", "technical_work"] as const;

export const SEO_ACTIVITY_DEFAULT_TYPE: TSeoActivityType = "blogs";

export const SEO_ACTIVITY_DEFAULT_PER_PAGE = 6;

export const SEO_ACTIVITY_MAX_PER_PAGE = 100;

export const SEO_ACTIVITY_TYPE_OPTIONS: readonly TSeoActivityType[] = SEO_ACTIVITY_TYPES;
