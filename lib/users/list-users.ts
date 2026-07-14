import { NextResponse } from "next/server";
import type { FilterQuery } from "mongoose";

import { ApiResponse } from "@/lib/api/response";
import { SUPER_ADMIN_ROLE } from "@/lib/rbac/roles";
import { serializeAdminUserListItem } from "@/lib/serializers/admin-user";
import type { TUserAccountStatus } from "@/lib/users/constants";
import { resolveUserProjectAssignments } from "@/lib/users/resolve-user-project-assignments";
import {
  buildUserStatusCounts,
  EMPTY_USER_STATUS_COUNTS,
} from "@/lib/users/user-status-filter.utils";
import type { ListUsersQueryInput } from "@/schemas/list-users-query";
import type { TPaginatedList, TAdminUserListItem, TListPagination } from "@/types/admin-user.types";
import { User, type UserDocument } from "@/models";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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

function buildSearchFilter(search?: string): FilterQuery<UserDocument> | null {
  if (!search) return null;

  const pattern = escapeRegex(search);
  return {
    $or: [{ name: { $regex: pattern, $options: "i" } }, { email: { $regex: pattern, $options: "i" } }],
  };
}

function buildStatusFilter(status?: TUserAccountStatus): FilterQuery<UserDocument> | null {
  if (status === "inactive") {
    return { status: "inactive" };
  }
  if (status === "active") {
    // Treat missing status as active for legacy documents.
    return { status: { $ne: "inactive" } };
  }
  return null;
}

function combineFilters(parts: Array<FilterQuery<UserDocument> | null>): FilterQuery<UserDocument> {
  const active = parts.filter((part): part is FilterQuery<UserDocument> => part != null);
  if (active.length === 0) return {};
  if (active.length === 1) return active[0]!;
  return { $and: active };
}

function buildListUsersFilter(search?: string, status?: TUserAccountStatus): FilterQuery<UserDocument> {
  return combineFilters([
    { roles: { $nin: [SUPER_ADMIN_ROLE] } },
    buildSearchFilter(search),
    buildStatusFilter(status),
  ]);
}

async function countUsersByStatus(baseFilter: FilterQuery<UserDocument>) {
  const [active, inactive] = await Promise.all([
    User.countDocuments(combineFilters([baseFilter, buildStatusFilter("active")])),
    User.countDocuments(combineFilters([baseFilter, buildStatusFilter("inactive")])),
  ]);

  return buildUserStatusCounts(active, inactive);
}

export async function listUsers(query: ListUsersQueryInput): Promise<TPaginatedList<TAdminUserListItem>> {
  const baseFilter = buildListUsersFilter(query.search);
  const filter = buildListUsersFilter(query.search, query.status);
  const page = query.page;
  const perPage = query.per_page;
  const skip = (page - 1) * perPage;

  const [total, users, statusCounts] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .select("-password")
      .sort({ createdAt: query.newest ? -1 : 1 })
      .skip(skip)
      .limit(perPage),
    countUsersByStatus(baseFilter),
  ]);

  const pagination = buildPagination(total, page, perPage);
  const projectsByUserId = await resolveUserProjectAssignments(users.map((user) => user._id));

  return {
    items: users.map((user) =>
      serializeAdminUserListItem(user, projectsByUserId.get(user._id.toString()) ?? []),
    ),
    pagination,
    filters: {
      search: query.search ?? null,
      newest: query.newest,
      status: query.status ?? null,
      status_counts: statusCounts ?? EMPTY_USER_STATUS_COUNTS,
    },
  };
}

export function buildListUsersResponse(result: TPaginatedList<TAdminUserListItem>): NextResponse {
  return ApiResponse.success(result);
}
