"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { baseQuery } from "@/lib/frontend/api/base";
import type { TRoleStatus } from "@/lib/roles/constants";
import type { TAdminRoleDetail, TPaginatedRoleList } from "@/types/admin-role.types";

const rolesApi = {
  reducerPath: "roles-api" as const,
};

const rolesKeys = {
  all: [rolesApi.reducerPath] as const,
  list: (params: {
    page: number;
    per_page: number;
    search?: string | null;
    newest?: boolean;
    status?: string | null;
  }) => [...rolesKeys.all, "list", params] as const,
  detail: (roleId: string) => [...rolesKeys.all, "detail", roleId] as const,
};

export { rolesKeys };

export type RolesListParams = {
  page?: number;
  per_page?: number;
  search?: string | null;
  newest?: boolean;
  status?: TRoleStatus | null;
};

export type TRolePayload = {
  name: string;
  description: string;
  permissions: string[];
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

  if (params.status === "active" || params.status === "inactive") {
    searchParams.set("status", params.status);
  }

  const envelope = await baseQuery.get<TPaginatedRoleList>(`admin/roles?${searchParams.toString()}`);
  return envelope.data;
}

export function useRolesQuery(params: RolesListParams & { enabled?: boolean }) {
  const page = params.page ?? 1;
  const perPage = params.per_page ?? 15;
  const search = params.search?.trim() || null;
  const newest = params.newest !== false;
  const status = params.status ?? null;

  return useQuery({
    queryKey: rolesKeys.list({ page, per_page: perPage, search, newest, status }),
    queryFn: () => fetchRoles({ page, per_page: perPage, search, newest, status }),
    enabled: params.enabled ?? true,
  });
}

async function fetchRole(roleId: string): Promise<TAdminRoleDetail> {
  const envelope = await baseQuery.get<TAdminRoleDetail>(`admin/roles/${roleId}`);
  return envelope.data;
}

export function useRoleQuery(roleId: string | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: rolesKeys.detail(roleId ?? ""),
    queryFn: () => fetchRole(roleId!),
    enabled: Boolean(roleId) && (options?.enabled ?? true),
  });
}

export function useCreateRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: TRolePayload) => {
      const envelope = await baseQuery.post<TAdminRoleDetail>("admin/roles", payload);
      return envelope.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rolesKeys.all });
    },
  });
}

export function useUpdateRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, payload }: { roleId: string; payload: TRolePayload }) => {
      const envelope = await baseQuery.patch<TAdminRoleDetail>(`admin/roles/${roleId}`, payload);
      return envelope.data;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: rolesKeys.all });
      void queryClient.invalidateQueries({ queryKey: rolesKeys.detail(variables.roleId) });
    },
  });
}

export type TRoleStatusAction = "activate" | "deactivate";

type TRoleStatusActionInput = {
  roleId: string;
  action: TRoleStatusAction;
};

async function postRoleStatusAction({
  roleId,
  action,
}: TRoleStatusActionInput): Promise<{ data: TAdminRoleDetail; message: string | null }> {
  const envelope = await baseQuery.post<TAdminRoleDetail>(`admin/roles/${roleId}/${action}`);
  return { data: envelope.data, message: envelope.message };
}

export function useRoleStatusActionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postRoleStatusAction,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: rolesKeys.all });
      void queryClient.invalidateQueries({ queryKey: rolesKeys.detail(variables.roleId) });
    },
  });
}
