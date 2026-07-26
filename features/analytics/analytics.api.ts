"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { baseQuery } from "@/lib/frontend/api/base";
import type { TGoogleIntegrationService } from "@/lib/integrations/constants";
import type {
  TAnalyticsDimensionsDto,
  TAnalyticsOverviewDto,
  TAnalyticsSyncResultDto,
  TGooglePropertyOption,
  TProjectIntegrationDto,
} from "@/types/analytics.types";

const analyticsApi = {
  reducerPath: "analytics-api" as const,
};

export const analyticsKeys = {
  all: [analyticsApi.reducerPath] as const,
  overview: (projectId: string, from: string, to: string) =>
    [...analyticsKeys.all, "overview", projectId, from, to] as const,
  dimensions: (
    projectId: string,
    params: {
      from: string;
      to: string;
      source: string;
      dimensionType: string;
      limit: number;
    },
  ) => [...analyticsKeys.all, "dimensions", projectId, params] as const,
  properties: (projectId: string) => [...analyticsKeys.all, "properties", projectId] as const,
};

export type TAnalyticsOverviewParams = {
  from: string;
  to: string;
};

export type TAnalyticsDimensionsParams = {
  from: string;
  to: string;
  source: "gsc" | "ga4";
  dimensionType: "query" | "page" | "country" | "device" | "landing_page";
  limit?: number;
};

async function fetchOverview(
  projectId: string,
  params: TAnalyticsOverviewParams,
): Promise<TAnalyticsOverviewDto> {
  const searchParams = new URLSearchParams({
    from: params.from,
    to: params.to,
  });
  const envelope = await baseQuery.get<TAnalyticsOverviewDto>(
    `projects/${projectId}/analytics/overview?${searchParams.toString()}`,
  );
  return envelope.data;
}

async function fetchDimensions(
  projectId: string,
  params: TAnalyticsDimensionsParams,
): Promise<TAnalyticsDimensionsDto> {
  const searchParams = new URLSearchParams({
    from: params.from,
    to: params.to,
    source: params.source,
    dimensionType: params.dimensionType,
    limit: String(params.limit ?? 25),
  });
  const envelope = await baseQuery.get<TAnalyticsDimensionsDto>(
    `projects/${projectId}/analytics/dimensions?${searchParams.toString()}`,
  );
  return envelope.data;
}

export function useAnalyticsOverviewQuery(
  projectId: string | null | undefined,
  params: TAnalyticsOverviewParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: analyticsKeys.overview(projectId ?? "", params.from, params.to),
    queryFn: () => fetchOverview(projectId!, params),
    enabled: Boolean(projectId) && (options?.enabled ?? true),
  });
}

export function useAnalyticsDimensionsQuery(
  projectId: string | null | undefined,
  params: TAnalyticsDimensionsParams,
  options?: { enabled?: boolean },
) {
  const limit = params.limit ?? 25;
  const queryParams = {
    from: params.from,
    to: params.to,
    source: params.source,
    dimensionType: params.dimensionType,
    limit,
  };

  return useQuery({
    queryKey: analyticsKeys.dimensions(projectId ?? "", queryParams),
    queryFn: () => fetchDimensions(projectId!, { ...params, limit }),
    enabled: Boolean(projectId) && (options?.enabled ?? true),
  });
}

export function useGooglePropertiesQuery(
  projectId: string | null | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: analyticsKeys.properties(projectId ?? ""),
    queryFn: async () => {
      const envelope = await baseQuery.get<{ properties: TGooglePropertyOption[] }>(
        `projects/${projectId}/integrations/google/properties`,
      );
      return envelope.data.properties;
    },
    enabled: Boolean(projectId) && (options?.enabled ?? true),
  });
}

export function useConnectGoogleIntegrationMutation(projectId: string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      service: TGoogleIntegrationService;
      externalPropertyId: string;
    }) => {
      const envelope = await baseQuery.put<TProjectIntegrationDto>(
        `projects/${projectId}/integrations/google/${payload.service}`,
        { externalPropertyId: payload.externalPropertyId },
      );
      return envelope.data;
    },
    onSuccess: () => {
      if (!projectId) return;
      void queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
    },
  });
}

export function useDisconnectGoogleIntegrationMutation(projectId: string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (service: TGoogleIntegrationService) => {
      const envelope = await baseQuery.delete<TProjectIntegrationDto | null>(
        `projects/${projectId}/integrations/google/${service}`,
      );
      return envelope.data;
    },
    onSuccess: () => {
      if (!projectId) return;
      void queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
    },
  });
}

export function useSyncGoogleIntegrationsMutation(projectId: string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const envelope = await baseQuery.post<TAnalyticsSyncResultDto>(
        `projects/${projectId}/integrations/google/sync`,
      );
      return envelope.data;
    },
    onSuccess: () => {
      if (!projectId) return;
      void queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
    },
  });
}
