"use client";

import { useQuery } from "@tanstack/react-query";

import { baseQuery } from "@/lib/frontend/api/base";
import type { TPaginatedRoleList } from "@/types/admin-role.types";

const rolesApi = {
  reducerPath: "roles-api" as const,
};

const rolesKeys = {
  all: [rolesApi.reducerPath] as const,
  list: (params: { page: number; per_page: number; search?: string | null; newest?: boolean }) =>
    [...rolesKeys.all, "list", params] as const,
};

export type RolesListParams = {
  page?: number;
  per_page?: number;
  search?: string | null;
  newest?: boolean;
};

async function fetchRoles(params: RolesListParams): Promise<TPaginatedRoleList> {
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

  const envelope = await baseQuery.get<TPaginatedRoleList>(`admin/roles?${searchParams.toString()}`);
  return envelope.data;
}

export function useRolesQuery(params: RolesListParams & { enabled?: boolean }) {
  const page = params.page ?? 1;
  const perPage = params.per_page ?? 15;
  const search = params.search?.trim() || null;
  const newest = params.newest !== false;

  return useQuery({
    queryKey: rolesKeys.list({ page, per_page: perPage, search, newest }),
    queryFn: () => fetchRoles({ page, per_page: perPage, search, newest }),
    enabled: params.enabled ?? true,
  });
}
