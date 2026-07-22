"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { baseQuery } from "@/lib/frontend/api/base";
import type { TListPagination } from "@/types/admin-user.types";
import type {
  TSeoActivityRow,
  TSeoActivityType,
  TSeoActivityTypeCounts,
} from "@/types/seo-activity.types";

const seoActivitiesApi = {
  reducerPath: "seo-activities-api" as const,
};

export const seoActivityKeys = {
  all: [seoActivitiesApi.reducerPath] as const,
  list: (projectId: string, type: TSeoActivityType, page: number) =>
    [...seoActivityKeys.all, "list", projectId, type, page] as const,
  sheet: [...seoActivitiesApi.reducerPath, "sheet"] as const,
};

export type TSeoActivitiesListData = {
  items: TSeoActivityRow[];
  pagination: TListPagination;
  filters: { type: TSeoActivityType };
  counts: TSeoActivityTypeCounts;
};

export type TSeoActivitiesSheetSource = {
  spreadsheetId: string;
  spreadsheetUrl: string;
  lastSyncedAt: string | null;
  status: "idle" | "running" | "error";
  lastError: string | null;
};

export type TSeoActivitySyncResult = {
  types: Array<{
    activityType: TSeoActivityType;
    fetched: number;
    imported: number;
    skipped: number;
    deleted: number;
  }>;
  totals: {
    fetched: number;
    imported: number;
    skipped: number;
    deleted: number;
  };
};

async function fetchProjectSeoActivities(
  projectId: string,
  type: TSeoActivityType,
  page: number,
): Promise<TSeoActivitiesListData> {
  const params = new URLSearchParams({
    type,
    page: String(page),
  });
  const envelope = await baseQuery.get<TSeoActivitiesListData>(
    `projects/${projectId}/seo-activities?${params.toString()}`,
  );
  return envelope.data;
}

type TUseSeoActivitiesQueryOptions = {
  enabled?: boolean;
};

export function useSeoActivitiesQuery(
  projectId: string | null | undefined,
  type: TSeoActivityType,
  page: number,
  options: TUseSeoActivitiesQueryOptions = {},
) {
  const enabled = Boolean(projectId) && (options.enabled ?? true);

  return useQuery({
    queryKey: seoActivityKeys.list(projectId ?? "", type, page),
    queryFn: () => fetchProjectSeoActivities(projectId!, type, page),
    enabled,
  });
}

export function useSeoActivitiesSheetQuery(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: seoActivityKeys.sheet,
    queryFn: async () => {
      const envelope = await baseQuery.get<TSeoActivitiesSheetSource>("admin/seo-activities/sheet");
      return envelope.data;
    },
    enabled: options.enabled ?? true,
  });
}

export function useUpdateSeoActivitiesSheetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (spreadsheetUrl: string) => {
      const envelope = await baseQuery.patch<TSeoActivitiesSheetSource>("admin/seo-activities/sheet", {
        spreadsheetUrl,
      });
      return envelope;
    },
    onSuccess: async (envelope) => {
      queryClient.setQueryData(seoActivityKeys.sheet, envelope.data);
      await queryClient.invalidateQueries({ queryKey: seoActivityKeys.sheet });
    },
  });
}

export function useSyncSeoActivitiesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const envelope = await baseQuery.post<TSeoActivitySyncResult>("admin/seo-activities/sync");
      return envelope;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: seoActivityKeys.all });
    },
  });
}
