"use client";

import { useQuery } from "@tanstack/react-query";

import { baseQuery } from "@/lib/frontend/api/base";
import type { TAdminUserListItem, TPaginatedList } from "@/types/admin-user.types";

const usersApi = {
  reducerPath: "users-api" as const,
};

const usersKeys = {
  all: [usersApi.reducerPath] as const,
  list: (params: { page: number; per_page: number; search?: string | null; newest?: boolean }) =>
    [...usersKeys.all, "list", params] as const,
};

export type UsersListParams = {
  page?: number;
  per_page?: number;
  search?: string | null;
  newest?: boolean;
};

async function fetchUsers(params: UsersListParams): Promise<TPaginatedList<TAdminUserListItem>> {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("per_page", String(params.per_page ?? 15));

  const search = params.search?.trim();
  if (search) {
    searchParams.set("search", search);
  }

  if (params.newest === false) {
    searchParams.set("newest", "false");
  }

  const envelope = await baseQuery.get<TPaginatedList<TAdminUserListItem>>(`users?${searchParams.toString()}`);
  return envelope.data;
}

export function useUsersQuery(params: UsersListParams & { enabled?: boolean }) {
  const page = params.page ?? 1;
  const perPage = params.per_page ?? 15;
  const search = params.search?.trim() || null;
  const newest = params.newest !== false;

  return useQuery({
    queryKey: usersKeys.list({ page, per_page: perPage, search, newest }),
    queryFn: () => fetchUsers({ page, per_page: perPage, search, newest }),
    enabled: params.enabled ?? true,
  });
}
