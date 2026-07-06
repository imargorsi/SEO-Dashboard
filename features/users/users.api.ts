"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AdminUserItem, PaginatedList } from "@/lib/dummy-data";
import { createDummyUser, listDummyUsers } from "@/lib/dummy-data/users";

const usersApi = {
  reducerPath: "users-api" as const,
};

const usersKeys = {
  all: [usersApi.reducerPath] as const,
  list: (params: { page: number; per_page: number }) =>
    [...usersKeys.all, "list", params] as const,
};

export type UsersListParams = {
  page?: number;
  per_page?: number;
  search?: string | null;
};

async function fetchUsers(params: UsersListParams): Promise<PaginatedList<AdminUserItem>> {
  await new Promise((r) => setTimeout(r, 200));
  return listDummyUsers({
    page: params.page ?? 1,
    per_page: params.per_page ?? 15,
    search: params.search,
  });
}

export function useUsersQuery(params: UsersListParams) {
  const page = params.page ?? 1;
  const perPage = params.per_page ?? 15;

  return useQuery({
    queryKey: usersKeys.list({ page, per_page: perPage }),
    queryFn: () => fetchUsers({ page, per_page: perPage, search: params.search }),
  });
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name: string; email: string }) => {
      await new Promise((r) => setTimeout(r, 300));
      return createDummyUser(payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
}
