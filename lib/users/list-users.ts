import { NextResponse } from "next/server";

import { ApiResponse } from "@/lib/api/response";
import { SUPER_ADMIN_ROLE } from "@/lib/rbac/roles";
import { serializeAdminUserListItem } from "@/lib/serializers/admin-user";
import { resolveUserProjectRoleSlugs } from "@/lib/users/resolve-user-project-role-slugs";
import type { ListUsersQueryInput } from "@/schemas/list-users-query";
import type { TPaginatedList, TAdminUserListItem, TListPagination } from "@/types/admin-user.types";
import { User } from "@/models";

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

function buildSearchFilter(search?: string) {
  if (!search) return {};

  const pattern = escapeRegex(search);
  return {
    $or: [{ name: { $regex: pattern, $options: "i" } }, { email: { $regex: pattern, $options: "i" } }],
  };
}

function buildListUsersFilter(search?: string) {
  const excludeSuperAdmin = { roles: { $nin: [SUPER_ADMIN_ROLE] } };
  const searchFilter = buildSearchFilter(search);

  if (!search) return excludeSuperAdmin;

  return { $and: [excludeSuperAdmin, searchFilter] };
}

export async function listUsers(query: ListUsersQueryInput): Promise<TPaginatedList<TAdminUserListItem>> {
  const filter = buildListUsersFilter(query.search);
  const page = query.page;
  const perPage = query.per_page;
  const skip = (page - 1) * perPage;

  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .select("-password")
      .sort({ createdAt: query.newest ? -1 : 1 })
      .skip(skip)
      .limit(perPage),
  ]);

  const pagination = buildPagination(total, page, perPage);
  const projectRoleSlugsByUserId = await resolveUserProjectRoleSlugs(users.map((user) => user._id));

  return {
    items: users.map((user) =>
      serializeAdminUserListItem(user, projectRoleSlugsByUserId.get(user._id.toString()) ?? []),
    ),
    pagination,
    filters: {
      search: query.search ?? null,
      newest: query.newest,
    },
  };
}

export function buildListUsersResponse(result: TPaginatedList<TAdminUserListItem>): NextResponse {
  return ApiResponse.success(result);
}
