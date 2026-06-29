"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAuthUser, loginWithCredentials } from "@/features/auth/api";
import { apiClient } from "@/lib/frontend/api/client";
import { ApiError } from "@/lib/frontend/api/errors";
import { clearAuthSession, getAccessToken, getStoredAuthUser, persistAuthSession } from "@/lib/frontend/auth/session";
import { queryKeys } from "@/lib/frontend/query/query-keys";

async function loadAuthUser() {
  try {
    return await fetchAuthUser();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearAuthSession();
    }
    throw error;
  }
}

export function useAuthUserQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: loadAuthUser,
    enabled: options?.enabled ?? Boolean(getAccessToken()),
    placeholderData: () => getStoredAuthUser() ?? undefined,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...queryKeys.auth.all, "login"] as const,
    mutationFn: loginWithCredentials,
    onSuccess: (result) => {
      persistAuthSession(result.token, result.user);
      queryClient.setQueryData(queryKeys.auth.user(), result.user);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...queryKeys.auth.all, "logout"] as const,
    mutationFn: () => apiClient.post<null>("auth/logout"),
    onSettled: () => {
      clearAuthSession();
      queryClient.removeQueries({ queryKey: queryKeys.auth.all });
    },
  });
}
