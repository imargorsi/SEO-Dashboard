import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { ApiResponse } from "@/lib/api/response";
import { NotFoundError } from "@/lib/api/http-errors";
import {
  SEO_ACTIVITY_LIST_DEFAULT_PER_PAGE,
  SEO_ACTIVITY_LIST_MAX_PER_PAGE,
} from "@/lib/seo-activities/constants";
import { emptyCounts, serializeSeoActivity } from "@/lib/seo-activities/serialize-seo-activity";
import type { ListSeoActivitiesQueryInput } from "@/schemas/list-seo-activities-query";
import type { TListPagination } from "@/types/admin-user.types";
import type { TSeoActivityType, TSeoActivityTypeCounts } from "@/types/seo-activity.types";
import { Project, SeoActivity } from "@/models";

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

async function countByType(projectId: mongoose.Types.ObjectId): Promise<TSeoActivityTypeCounts> {
  const grouped = await SeoActivity.aggregate<{ _id: TSeoActivityType; count: number }>([
    { $match: { projectId } },
    { $group: { _id: "$activityType", count: { $sum: 1 } } },
  ]);

  const counts = emptyCounts();
  for (const row of grouped) {
    if (row._id in counts) {
      counts[row._id] = row.count;
    }
  }
  return counts;
}

export async function listProjectSeoActivities(
  projectId: string,
  query: ListSeoActivitiesQueryInput,
) {
  if (!mongoose.isValidObjectId(projectId)) {
    throw new NotFoundError("Project");
  }

  const project = await Project.findById(projectId).select("_id status");
  if (!project || project.status === "rejected") {
    throw new NotFoundError("Project");
  }

  const perPage = Math.min(
    query.per_page ?? SEO_ACTIVITY_LIST_DEFAULT_PER_PAGE,
    SEO_ACTIVITY_LIST_MAX_PER_PAGE,
  );
  const page = query.page;
  const activityType = query.type;
  const projectObjectId = project._id as mongoose.Types.ObjectId;
  const filter = { projectId: projectObjectId, activityType };

  const [total, docs, counts] = await Promise.all([
    SeoActivity.countDocuments(filter),
    SeoActivity.find(filter)
      .sort({ occurredOn: -1, sourceRowNumber: 1 })
      .skip((page - 1) * perPage)
      .limit(perPage),
    countByType(projectObjectId),
  ]);

  const pagination = buildPagination(total, page, perPage);
  const safePage = pagination.current_page;
  const items =
    safePage === page
      ? docs.map(serializeSeoActivity)
      : (
          await SeoActivity.find(filter)
            .sort({ occurredOn: -1, sourceRowNumber: 1 })
            .skip((safePage - 1) * perPage)
            .limit(perPage)
        ).map(serializeSeoActivity);

  return {
    items,
    pagination,
    counts,
    filters: { type: activityType },
  };
}

export function buildListSeoActivitiesResponse(
  result: Awaited<ReturnType<typeof listProjectSeoActivities>>,
): NextResponse {
  return ApiResponse.success(
    {
      items: result.items,
      pagination: result.pagination,
      filters: result.filters,
      counts: result.counts,
    },
    null,
  );
}
