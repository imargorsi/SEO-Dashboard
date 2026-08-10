"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAccessToken } from "@/hooks/use-access-token.hook";
import { baseQuery } from "@/lib/frontend/api/base";
import type {
  TAssistantHistoryDto,
  TAssistantQueryResult,
} from "@/types/assistant.types";

const assistantApi = {
  reducerPath: "assistant-api" as const,
};

export const assistantKeys = {
  all: [assistantApi.reducerPath] as const,
  history: (projectId: string) => [...assistantKeys.all, "history", projectId] as const,
};

export type TAssistantQueryPayload = {
  query: string;
};

export function useAssistantHistoryQuery(
  projectId: string | null | undefined,
  options?: { enabled?: boolean },
) {
  const token = useAccessToken();
  return useQuery({
    queryKey: assistantKeys.history(projectId ?? ""),
    queryFn: async () => {
      const envelope = await baseQuery.get<TAssistantHistoryDto>(
        `projects/${projectId}/assistant/history`,
      );
      return envelope.data;
    },
    enabled: Boolean(projectId) && (options?.enabled ?? true) && Boolean(token),
  });
}

export function useAssistantQueryMutation(projectId: string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: TAssistantQueryPayload) => {
      if (!projectId) throw new Error("Missing project id");
      const envelope = await baseQuery.post<TAssistantQueryResult>(
        `projects/${projectId}/assistant/query`,
        payload,
      );
      return envelope.data;
    },
    onSuccess: (data) => {
      if (!projectId) return;
      queryClient.setQueryData(assistantKeys.history(projectId), {
        items: data.history,
      } satisfies TAssistantHistoryDto);
    },
  });
}
