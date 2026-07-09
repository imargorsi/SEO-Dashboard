"use client";

import { useQuery } from "@tanstack/react-query";

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

async function fetchProjects(): Promise<TProjectListItem[]> {
  const envelope = await baseQuery.get<ProjectsListEnvelope>("projects");
  return envelope.data.items ?? [];
}

export function useProjectsQuery() {
  return useQuery({
    queryKey: projectKeys.list(),
    queryFn: fetchProjects,
  });
}

export function mapProjectStatusToCardStatus(status: TProjectListItem["status"]): TProjectCardStatus {
  if (status === "pending") return "pending_approval";
  if (status === "approved") return "active";
  return "deactive";
}
