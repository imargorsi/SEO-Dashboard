import { NextResponse } from "next/server";

import { ApiResponse } from "@/lib/api/response";
import { HIDDEN_ADMIN_ROLE_SLUGS } from "@/lib/rbac/roles";
import { filterVisibleAdminRoles, purgeHiddenAdminRoles } from "@/lib/rbac/purge-hidden-admin-roles";
import { serializeAdminRoleListItem } from "@/lib/serializers/admin-role";
import { resolveRoleMemberCounts } from "@/lib/roles/resolve-role-member-counts";
import { escapeRegex } from "@/lib/roles/role-mutation.utils";
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

function buildSearchFilter(search?: string) {
  if (!search) return {};

  const pattern = escapeRegex(search);
  return {
    $or: [
      { name: { $regex: pattern, $options: "i" } },
      { slug: { $regex: pattern, $options: "i" } },
      { description: { $regex: pattern, $options: "i" } },
    ],
  };
}

function buildListRolesFilter(search?: string) {
  const hiddenKeys = [...HIDDEN_ADMIN_ROLE_SLUGS];
  const namePattern = `^(${hiddenKeys.map((slug) => slug.replace(/_/g, "[_\\s-]*")).join("|")})$`;

  const excludeHidden = {
    $and: [
      { slug: { $nin: hiddenKeys } },
      { name: { $not: { $regex: namePattern, $options: "i" } } },
    ],
  };
  const searchFilter = buildSearchFilter(search);

  if (!search) return excludeHidden;

  return { $and: [excludeHidden, searchFilter] };
}

export async function listRoles(query: ListRolesQueryInput): Promise<TPaginatedRoleList> {
  await purgeHiddenAdminRoles();

  const filter = buildListRolesFilter(query.search);
  const page = query.page;
  const perPage = query.per_page;
  const skip = (page - 1) * perPage;

  const [totalBeforeFilter, roles] = await Promise.all([
    Role.countDocuments(filter),
    Role.find(filter)
      .sort({ createdAt: query.newest ? -1 : 1 })
      .skip(skip)
      .limit(perPage),
  ]);

  const visibleRoles = filterVisibleAdminRoles(roles);
  // Prefer purged count; if any slipped past the query, subtract them from total.
  const total = Math.max(0, totalBeforeFilter - (roles.length - visibleRoles.length));
  const pagination = buildPagination(total, page, perPage);
  const memberCountsByRoleId = await resolveRoleMemberCounts(visibleRoles.map((role) => role._id));

  return {
    items: visibleRoles.map((role) =>
      serializeAdminRoleListItem(role, memberCountsByRoleId.get(role._id.toString()) ?? 0),
    ),
    pagination,
    filters: {
      search: query.search ?? null,
      newest: query.newest,
    },
  };
}

export function buildListRolesResponse(result: TPaginatedRoleList): NextResponse {
  return ApiResponse.success(result);
}
