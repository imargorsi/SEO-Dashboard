"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { baseQuery } from "@/lib/frontend/api/base";
import type { ProjectStatus } from "@/lib/projects/constants";

export type TProjectListItem = {
  id: string;
  businessName: string;
  websiteUrl: string;
  status: ProjectStatus;
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
  status: ProjectStatus;
  logoImage: string | null;
};

export type TCreateProjectMutationInput = {
  payload: TCreateProjectPayload;
  companyLogoFile?: File | null;
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
    mutationFn: async ({ payload, companyLogoFile }: TCreateProjectMutationInput) => {
      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));
      if (companyLogoFile) {
        formData.append("company_logo", companyLogoFile);
      }

      const envelope = await baseQuery.post<CreateProjectResponse>("projects", formData);
      return envelope.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}
