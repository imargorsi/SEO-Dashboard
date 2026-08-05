"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAccessToken } from "@/hooks/use-access-token.hook";
import { baseQuery } from "@/lib/frontend/api/base";
import type { TUserLookupItem } from "@/types/project-invite.types";
import type { TAdminUserDetail, TAdminUserListItem, TAdminUserProjectAssignment, TPaginatedList } from "@/types/admin-user.types";

const usersApi = {
  reducerPath: "users-api" as const,
};

const usersKeys = {
  all: [usersApi.reducerPath] as const,
  list: (params: {
    page: number;
    per_page: number;
    search?: string | null;
    newest?: boolean;
    status?: string | null;
  }) => [...usersKeys.all, "list", params] as const,
  detail: (userId: string) => [...usersKeys.all, "detail", userId] as const,
  lookup: (search: string) => [...usersKeys.all, "lookup", search] as const,
};

export { usersKeys };

export type { TUserLookupItem };

export type UsersListParams = {
  page?: number;
  per_page?: number;
  search?: string | null;
  newest?: boolean;
  status?: "active" | "inactive" | null;
};

type TCreateUserPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

type TUpdateUserPayload = {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
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

  if (params.status === "active" || params.status === "inactive") {
    searchParams.set("status", params.status);
  }

  const envelope = await baseQuery.get<TPaginatedList<TAdminUserListItem>>(`users?${searchParams.toString()}`);
  return envelope.data;
}

export function useUsersQuery(params: UsersListParams & { enabled?: boolean }) {
  const token = useAccessToken();
  const page = params.page ?? 1;
  const perPage = params.per_page ?? 15;
  const search = params.search?.trim() || null;
  const newest = params.newest !== false;
  const status = params.status ?? null;

  return useQuery({
    queryKey: usersKeys.list({ page, per_page: perPage, search, newest, status }),
    queryFn: () => fetchUsers({ page, per_page: perPage, search, newest, status }),
    enabled: (params.enabled ?? true) && Boolean(token),
  });
}

async function fetchUser(userId: string): Promise<TAdminUserDetail> {
  const envelope = await baseQuery.get<TAdminUserDetail>(`users/${userId}`);
  return envelope.data;
}

export function useUserQuery(userId: string | undefined, options?: { enabled?: boolean }) {
  const token = useAccessToken();
  return useQuery({
    queryKey: usersKeys.detail(userId ?? ""),
    queryFn: () => fetchUser(userId!),
    enabled: Boolean(userId) && (options?.enabled ?? true) && Boolean(token),
  });
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      payload,
      profileImageFile,
    }: {
      payload: TCreateUserPayload;
      profileImageFile?: File | null;
    }) => {
      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));
      if (profileImageFile) {
        formData.append("profile_image", profileImageFile);
      }

      const envelope = await baseQuery.post<TAdminUserListItem>("users", formData);
      return envelope.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      payload,
      profileImageFile,
    }: {
      userId: string;
      payload: TUpdateUserPayload;
      profileImageFile?: File | null;
    }) => {
      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));
      if (profileImageFile) {
        formData.append("profile_image", profileImageFile);
      }

      const envelope = await baseQuery.patch<TAdminUserDetail>(`users/${userId}`, formData);
      return envelope.data;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: usersKeys.all });
      void queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.userId) });
    },
  });
}

export type TUserStatusAction = "activate" | "deactivate";

type TUserStatusActionInput = {
  userId: string;
  action: TUserStatusAction;
};

async function postUserStatusAction({
  userId,
  action,
}: TUserStatusActionInput): Promise<{ data: TAdminUserDetail; message: string | null }> {
  const envelope = await baseQuery.post<TAdminUserDetail>(`users/${userId}/${action}`);
  return { data: envelope.data, message: envelope.message };
}

export function useUserStatusActionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postUserStatusAction,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: usersKeys.all });
      void queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.userId) });
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const envelope = await baseQuery.delete<null>(`users/${userId}`);
      return { userId, message: envelope.message };
    },
    onSuccess: (_data, userId) => {
      void queryClient.invalidateQueries({ queryKey: usersKeys.all });
      void queryClient.removeQueries({ queryKey: usersKeys.detail(userId) });
    },
  });
}

export type TUpsertUserMembershipPayload = {
  projectId: string;
  roleId: string;
};

async function upsertUserMembership(
  userId: string,
  payload: TUpsertUserMembershipPayload,
): Promise<TAdminUserProjectAssignment[]> {
  const envelope = await baseQuery.put<{ projects: TAdminUserProjectAssignment[] }>(
    `users/${userId}/memberships`,
    payload,
  );
  return envelope.data.projects;
}

export function useUpsertUserMembershipMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      payload,
    }: {
      userId: string;
      payload: TUpsertUserMembershipPayload;
    }) => {
      const projects = await upsertUserMembership(userId, payload);
      return { userId, projects };
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: usersKeys.all });
      void queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.userId) });
    },
  });
}

export function useRemoveUserMembershipMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, projectId }: { userId: string; projectId: string }) => {
      const envelope = await baseQuery.delete<{ projects: TAdminUserProjectAssignment[] }>(
        `users/${userId}/memberships/${projectId}`,
      );
      return { userId, projects: envelope.data.projects };
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: usersKeys.all });
      void queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.userId) });
    },
  });
}

/** Apply staged memberships after create (sequential PUT). */
export async function applyUserMemberships(
  userId: string,
  memberships: TUpsertUserMembershipPayload[],
): Promise<void> {
  for (const payload of memberships) {
    await upsertUserMembership(userId, payload);
  }
}

async function fetchUserLookup(search: string): Promise<TUserLookupItem[]> {
  const searchParams = new URLSearchParams({ search, limit: "10" });
  const envelope = await baseQuery.get<{ items: TUserLookupItem[] }>(
    `users/lookup?${searchParams.toString()}`,
  );
  return envelope.data.items ?? [];
}

export function useUserLookupQuery(search: string, options?: { enabled?: boolean }) {
  const token = useAccessToken();
  const trimmed = search.trim();

  return useQuery({
    queryKey: usersKeys.lookup(trimmed),
    queryFn: () => fetchUserLookup(trimmed),
    enabled: (options?.enabled ?? true) && trimmed.length >= 2 && Boolean(token),
  });
}
