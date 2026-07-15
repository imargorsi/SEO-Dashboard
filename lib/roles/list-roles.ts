import { NextResponse } from "next/server";

import { ApiResponse } from "@/lib/api/response";
import { HIDDEN_ADMIN_ROLE_SLUGS } from "@/lib/rbac/roles";
import { filterVisibleAdminRoles, purgeHiddenAdminRoles } from "@/lib/rbac/purge-hidden-admin-roles";
import { serializeAdminRoleListItem } from "@/lib/serializers/admin-role";
import type { TRoleStatus } from "@/lib/roles/constants";
import { resolveRoleMemberCounts } from "@/lib/roles/resolve-role-member-counts";
import { escapeRegex } from "@/lib/roles/role-mutation.utils";
import { buildRoleStatusCounts, EMPTY_ROLE_STATUS_COUNTS } from "@/lib/roles/role-status-filter.utils";
import type { ListRolesQueryInput } from "@/schemas/list-roles-query";
import type { TListPagination } from "@/types/admin-user.types";
import type { TPaginatedRoleList } from "@/types/admin-role.types";
import { Role } from "@/models";

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

function combineFilters(parts: Array<object | null>) {
  const active = parts.filter((part): part is object => part != null);
  if (active.length === 0) return {};
  if (active.length === 1) return active[0]!;
  return { $and: active };
}

function buildSearchFilter(search?: string) {
  if (!search) return null;

  const pattern = escapeRegex(search);
  return {
    $or: [
      { name: { $regex: pattern, $options: "i" } },
      { slug: { $regex: pattern, $options: "i" } },
      { description: { $regex: pattern, $options: "i" } },
    ],
  };
}

function buildStatusFilter(status?: TRoleStatus) {
  if (status === "inactive") {
    return { status: "inactive" };
  }
  if (status === "active") {
    // Treat missing status as active for legacy documents.
    return { status: { $ne: "inactive" } };
  }
  return null;
}

function buildExcludeHiddenFilter() {
  const hiddenKeys = [...HIDDEN_ADMIN_ROLE_SLUGS];
  const namePattern = `^(${hiddenKeys.map((slug) => slug.replace(/_/g, "[_\\s-]*")).join("|")})$`;

  return {
    $and: [{ slug: { $nin: hiddenKeys } }, { name: { $not: { $regex: namePattern, $options: "i" } } }],
  };
}

function buildListRolesFilter(search?: string, status?: TRoleStatus) {
  return combineFilters([buildExcludeHiddenFilter(), buildSearchFilter(search), buildStatusFilter(status)]);
}

async function countRolesByStatus(baseFilter: object) {
  const [active, inactive] = await Promise.all([
    Role.countDocuments(combineFilters([baseFilter, buildStatusFilter("active")])),
    Role.countDocuments(combineFilters([baseFilter, buildStatusFilter("inactive")])),
  ]);

  return buildRoleStatusCounts(active, inactive);
}

export async function listRoles(query: ListRolesQueryInput): Promise<TPaginatedRoleList> {
  await purgeHiddenAdminRoles();

  const baseFilter = buildListRolesFilter(query.search);
  const filter = buildListRolesFilter(query.search, query.status);
  const page = query.page;
  const perPage = query.per_page;
  const skip = (page - 1) * perPage;

  const [totalBeforeFilter, roles, statusCounts] = await Promise.all([
    Role.countDocuments(filter),
    Role.find(filter)
      .sort({ createdAt: query.newest ? -1 : 1 })
      .skip(skip)
      .limit(perPage),
    countRolesByStatus(baseFilter),
  ]);

  const visibleRoles = filterVisibleAdminRoles(roles);
  // Prefer purged count; if any slipped past the query, subtract them from total.
  const total = Math.max(0, totalBeforeFilter - (roles.length - visibleRoles.length));
  const pagination = buildPagination(total, page, perPage);
  const memberCountsByRoleId = await resolveRoleMemberCounts(visibleRoles.map((role) => role._id));

  return {
    items: visibleRoles.map((role) =>
      serializeAdminRoleListItem(role, memberCountsByRoleId.get(role._id.toString()) ?? 0)
    ),
    pagination,
    filters: {
      search: query.search ?? null,
      newest: query.newest,
      status: query.status ?? null,
      status_counts: statusCounts ?? EMPTY_ROLE_STATUS_COUNTS,
    },
  };
}

export function buildListRolesResponse(result: TPaginatedRoleList): NextResponse {
  return ApiResponse.success(result);
}
