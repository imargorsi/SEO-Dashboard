import { NextResponse } from "next/server";

import { ApiResponse } from "@/lib/api/response";
import { serializeSeoActivity } from "@/lib/seo-activities/serialize-seo-activity";
import { SeoActivity } from "@/models";
import type { ListSeoActivitiesQueryInput } from "@/schemas/list-seo-activities-query";
import type { TListPagination } from "@/types/admin-user.types";
import type {
  TPaginatedSeoActivities,
  TSeoActivityType,
  TSeoActivityTypeCounts,
} from "@/types/seo-activity.types";

type TSeoActivityFilter = Record<string, unknown>;

function buildPagination(total: number, page: number, perPage: number): TListPagination {
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), lastPage);
  const from = total === 0 ? null : (safePage - 1) * perPage + 1;
  const to = total === 0 ? null : Math.min(safePage * perPage, total);

  return {
    current_page: safePage,
    last_page: lastPage,
    per_page: perPage,
    total,
    from,
    to,
    has_more_pages: safePage < lastPage,
    links: {
      first: safePage > 1 ? "?page=1" : null,
      last: safePage < lastPage ? `?page=${lastPage}` : null,
      prev: safePage > 1 ? `?page=${safePage - 1}` : null,
      next: safePage < lastPage ? `?page=${safePage + 1}` : null,
    },
  };
}

function buildDateFilter(from?: string, to?: string): TSeoActivityFilter {
  if (!from && !to) return {};
  const occurredOn: Record<string, string> = {};
  if (from) occurredOn.$gte = from;
  if (to) occurredOn.$lte = to;
  return { occurredOn };
}

async function countByType(
  projectId: string,
  dateFilter: TSeoActivityFilter,
): Promise<TSeoActivityTypeCounts> {
  const [blogs, backlinks, technical_work] = await Promise.all([
    SeoActivity.countDocuments({ projectId, activityType: "blogs", ...dateFilter }),
    SeoActivity.countDocuments({ projectId, activityType: "backlinks", ...dateFilter }),
    SeoActivity.countDocuments({ projectId, activityType: "technical_work", ...dateFilter }),
  ]);

  return { blogs, backlinks, technical_work };
}

export async function getSeoActivityCounts(
  projectId: string,
  from?: string | null,
  to?: string | null,
): Promise<TSeoActivityTypeCounts> {
  return countByType(projectId, buildDateFilter(from ?? undefined, to ?? undefined));
}

export async function listSeoActivities(
  projectId: string,
  query: ListSeoActivitiesQueryInput,
): Promise<TPaginatedSeoActivities> {
  const dateFilter = buildDateFilter(query.from, query.to);
  const filter: TSeoActivityFilter = {
    projectId,
    activityType: query.type,
    ...dateFilter,
  };

  const page = query.page;
  const perPage = query.per_page;
  const skip = (page - 1) * perPage;

  const [total, docs, type_counts] = await Promise.all([
    SeoActivity.countDocuments(filter),
    SeoActivity.find(filter)
      .sort({ occurredOn: -1, createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .exec(),
    countByType(projectId, dateFilter),
  ]);

  const pagination = buildPagination(total, page, perPage);

  return {
    items: docs.map(serializeSeoActivity),
    pagination,
    filters: {
      type: query.type as TSeoActivityType,
      from: query.from ?? null,
      to: query.to ?? null,
      type_counts,
    },
  };
}

export function buildListSeoActivitiesResponse(payload: TPaginatedSeoActivities): NextResponse {
  return ApiResponse.success(payload);
}
