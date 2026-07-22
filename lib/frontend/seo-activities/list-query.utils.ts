import {
  SEO_ACTIVITY_DEFAULT_TYPE,
  SEO_ACTIVITY_PER_PAGE,
  SEO_ACTIVITY_TYPE_OPTIONS,
} from "@/lib/frontend/seo-activities/constants";
import type { TSeoActivityType } from "@/types/seo-activity.types";

type TQueryValue = string | string[] | undefined;

export type TSeoActivitiesListQuery = {
  type: TSeoActivityType;
  page: number;
  perPage: number;
};

function firstValue(value: TQueryValue): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseSeoActivityType(value: TQueryValue): TSeoActivityType {
  const raw = firstValue(value)?.trim();
  if (!raw) return SEO_ACTIVITY_DEFAULT_TYPE;
  return (SEO_ACTIVITY_TYPE_OPTIONS as readonly string[]).includes(raw)
    ? (raw as TSeoActivityType)
    : SEO_ACTIVITY_DEFAULT_TYPE;
}

export function parseSeoActivitiesListQuery(
  params: Record<string, TQueryValue>,
): TSeoActivitiesListQuery {
  const pageRaw = Number(firstValue(params.page) ?? "1");
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;

  return {
    type: parseSeoActivityType(params.type),
    page,
    perPage: SEO_ACTIVITY_PER_PAGE,
  };
}

export function paginateItems<T>(items: readonly T[], page: number, perPage: number): T[] {
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * perPage;
  return items.slice(start, start + perPage);
}
