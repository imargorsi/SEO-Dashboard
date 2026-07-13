"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { baseQuery } from "@/lib/frontend/api/base";
import type { ProjectStatus, TSeoGoal } from "@/lib/projects/constants";
import type { TProjectStatusAction } from "@/lib/projects/project-card-actions.utils";
import type { TProjectDetail, TProjectListItem } from "@/types/project.types";

export type {
  TProjectBusinessHours,
  TProjectDetail,
  TProjectListItem,
  TProjectOwnerSummary,
} from "@/types/project.types";

const projectsApi = {
  reducerPath: "projects-api" as const,
};

const projectKeys = {
  all: [projectsApi.reducerPath] as const,
  list: (status?: ProjectStatus | null) => [...projectKeys.all, "list", status ?? "all"] as const,
  detail: (projectId: string) => [...projectKeys.all, "detail", projectId] as const,
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
  seoGoals?: TSeoGoal[];
  competitorUrls?: string[];
  ownerUserId?: string;
};

export type TUpdateProjectPayload = {
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
  seoGoals?: TSeoGoal[];
  competitorUrls?: string[];
};

export type TUpdateProjectMutationInput = {
  projectId: string;
  payload: TUpdateProjectPayload;
  companyLogoFile?: File | null;
};

async function fetchProjects(status?: ProjectStatus | null): Promise<TProjectListItem[]> {
  const path = status ? `projects?status=${encodeURIComponent(status)}` : "projects";
  const envelope = await baseQuery.get<ProjectsListEnvelope>(path);
  return envelope.data.items ?? [];
}

type TUseProjectsQueryOptions = {
  status?: ProjectStatus | null;
  enabled?: boolean;
};

export function useProjectsQuery(options?: TUseProjectsQueryOptions) {
  const status = options?.status ?? null;

  return useQuery({
    queryKey: projectKeys.list(status),
    queryFn: () => fetchProjects(status),
    enabled: options?.enabled ?? true,
  });
}

async function fetchProject(projectId: string): Promise<TProjectDetail> {
  const envelope = await baseQuery.get<TProjectDetail>(`projects/${projectId}`);
  return envelope.data;
}

type TUseProjectQueryOptions = {
  enabled?: boolean;
};

export function useProjectQuery(projectId: string, options?: TUseProjectQueryOptions) {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => fetchProject(projectId),
    enabled: (options?.enabled ?? true) && Boolean(projectId),
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

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, payload, companyLogoFile }: TUpdateProjectMutationInput) => {
      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));
      if (companyLogoFile) {
        formData.append("company_logo", companyLogoFile);
      }

      const envelope = await baseQuery.patch<TProjectDetail>(`projects/${projectId}`, formData);
      return envelope.data;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
      void queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) });
    },
  });
}

type TProjectStatusActionResponse = {
  id: string;
  status: ProjectStatus;
};

type TProjectStatusActionInput = {
  projectId: string;
  action: TProjectStatusAction;
};

async function postProjectStatusAction({
  projectId,
  action,
}: TProjectStatusActionInput): Promise<{ data: TProjectStatusActionResponse; message: string | null }> {
  const envelope = await baseQuery.post<TProjectStatusActionResponse>(`projects/${projectId}/${action}`);
  return { data: envelope.data, message: envelope.message };
}

export function useProjectStatusActionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postProjectStatusAction,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
      void queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) });
    },
  });
}

export type { TProjectStatusAction } from "@/lib/projects/project-card-actions.utils";
