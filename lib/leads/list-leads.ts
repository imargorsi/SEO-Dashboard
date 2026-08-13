import { NextResponse } from "next/server";

import { ApiResponse } from "@/lib/api/response";
import { serializeLead } from "@/lib/leads/serialize-lead";
import { todayLeadDate } from "@/lib/leads/normalize";
import { Lead } from "@/models";
import type { ListLeadsQueryInput } from "@/schemas/list-leads-query";
import type { TListPagination } from "@/types/admin-user.types";
import type { TLeadSummaryCounts, TPaginatedLeads } from "@/types/lead.types";

type TLeadFilter = Record<string, unknown>;

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

function buildLeadDateFilter(from?: string, to?: string): TLeadFilter {
  if (!from && !to) return {};
  const leadDate: Record<string, string> = {};
  if (from) leadDate.$gte = from;
  if (to) leadDate.$lte = to;
  return { leadDate };
}

function buildSearchFilter(q?: string): TLeadFilter {
  if (!q) return {};
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "i");
  return {
    $or: [{ firstName: regex }, { lastName: regex }, { email: regex }, { phone: regex }],
  };
}

function monthBounds(year: number, monthIndex: number): { from: string; to: string } {
  const from = `${year}-${String(monthIndex + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const to = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { from, to };
}

export type TLeadSummaryWindow = "this_month" | "last_month" | "this_year";

/** Calendar window bounds used by lead summary cards and assistant CTAs. */
export function getLeadSummaryWindowBounds(
  window: TLeadSummaryWindow,
  now = new Date(),
): { from: string; to: string } {
  const year = now.getFullYear();
  const month = now.getMonth();

  if (window === "this_month") {
    return monthBounds(year, month);
  }
  if (window === "last_month") {
    const lastMonthDate = new Date(year, month - 1, 1);
    return monthBounds(lastMonthDate.getFullYear(), lastMonthDate.getMonth());
  }
  return { from: `${year}-01-01`, to: todayLeadDate(now) };
}

export async function buildSummaryCounts(
  projectId: string,
  now = new Date(),
): Promise<TLeadSummaryCounts> {
  const thisMonth = getLeadSummaryWindowBounds("this_month", now);
  const lastMonth = getLeadSummaryWindowBounds("last_month", now);
  const thisYear = getLeadSummaryWindowBounds("this_year", now);

  const [total, this_month, last_month, this_year] = await Promise.all([
    Lead.countDocuments({ projectId }),
    Lead.countDocuments({
      projectId,
      leadDate: { $gte: thisMonth.from, $lte: thisMonth.to },
    }),
    Lead.countDocuments({
      projectId,
      leadDate: { $gte: lastMonth.from, $lte: lastMonth.to },
    }),
    Lead.countDocuments({
      projectId,
      leadDate: { $gte: thisYear.from, $lte: thisYear.to },
    }),
  ]);

  return { total, this_month, last_month, this_year };
}

export async function countLeadsInRange(
  projectId: string,
  from?: string | null,
  to?: string | null,
): Promise<number> {
  const dateFilter = buildLeadDateFilter(from ?? undefined, to ?? undefined);
  return Lead.countDocuments({ projectId, ...dateFilter });
}

export async function listLeads(
  projectId: string,
  query: ListLeadsQueryInput,
): Promise<TPaginatedLeads> {
  const dateFilter = buildLeadDateFilter(query.from, query.to);
  const searchFilter = buildSearchFilter(query.q);
  const filter: TLeadFilter = {
    projectId,
    ...dateFilter,
    ...searchFilter,
  };

  const page = query.page;
  const perPage = query.per_page;
  const skip = (page - 1) * perPage;

  const [total, docs, counts] = await Promise.all([
    Lead.countDocuments(filter),
    Lead.find(filter).sort({ leadDate: -1, createdAt: -1 }).skip(skip).limit(perPage),
    buildSummaryCounts(projectId),
  ]);

  return {
    items: docs.map(serializeLead),
    pagination: buildPagination(total, page, perPage),
    filters: {
      from: query.from ?? null,
      to: query.to ?? null,
      q: query.q ?? null,
      counts,
    },
  };
}

export function buildListLeadsResponse(payload: TPaginatedLeads): NextResponse {
  return ApiResponse.success(payload);
}
