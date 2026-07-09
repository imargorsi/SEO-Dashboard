"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { baseQuery } from "@/lib/frontend/api/base";

export type TProjectCardStatus = "pending_approval" | "active" | "deactive";

export type TProjectListItem = {
  id: string;
  businessName: string;
  websiteUrl: string;
  status: "pending" | "approved" | "rejected";
  imageUrl: string | null;
  owner: {
    id: string;
    name: string;
    profileImage: string | null;
  } | null;
};

const projectsApi = {
  reducerPath: "projects-api" as const,
};

const projectKeys = {
  all: [projectsApi.reducerPath] as const,
  list: () => [...projectKeys.all, "list"] as const,
};

type ProjectsListEnvelope = {
  items: TProjectListItem[];
};

type CreateProjectResponse = {
  id: string;
  businessName: string;
  websiteUrl: string;
  status: "pending" | "approved" | "rejected";
};

export type TCreateProjectPayload = {
  businessName: string;
  websiteUrl: string;
  businessAddress?: string | null;
  pocContactNumber?: string | null;
  servicesOffered?: string[];
  primaryServiceToPromote?: string | null;
  idealCustomerProfile?: string | null;
  targetLocations?: string[];
  businessHours?: {
    opensAt?: string | null;
    closesAt?: string | null;
  } | null;
  seoGoals?: string[];
  marketingAccess?: {
    websiteLogin?: string | null;
    websiteHosting?: string | null;
    googleAnalytics?: string | null;
    googleSearchConsole?: string | null;
    googleBusinessProfile?: string | null;
  } | null;
  competitorUrls?: string[];
  ownerUserId?: string;
};

async function fetchProjects(): Promise<TProjectListItem[]> {
  const envelope = await baseQuery.get<ProjectsListEnvelope>("projects");
  return envelope.data.items ?? [];
}

export function useProjectsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: projectKeys.list(),
    queryFn: fetchProjects,
    enabled: options?.enabled ?? true,
  });
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: TCreateProjectPayload) => {
      const envelope = await baseQuery.post<CreateProjectResponse>("projects", payload);
      return envelope.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function mapProjectStatusToCardStatus(status: TProjectListItem["status"]): TProjectCardStatus {
  if (status === "pending") return "pending_approval";
  if (status === "approved") return "active";
  return "deactive";
}
