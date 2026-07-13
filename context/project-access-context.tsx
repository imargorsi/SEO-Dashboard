"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import { useSelectedProject } from "@/context/selected-project-context";
import { useProjectAccessQuery } from "@/features/projects/projects.api";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { isSuperAdmin } from "@/lib/rbac/access";

type ProjectAccessContextValue = {
  projectPermissions: string[];
  projectRoles: string[];
  isLoading: boolean;
  isError: boolean;
  hasProjectContext: boolean;
};

const ProjectAccessContext = createContext<ProjectAccessContextValue | null>(null);

/**
 * Loads role + permissions for the sidebar-selected project via `GET /api/v1/projects/{id}/access`.
 */
export function ProjectAccessProvider({ children }: { children: ReactNode }) {
  const { selectedProject } = useSelectedProject();
  const { data: authUser } = useAuthUserQuery();
  const projectId = selectedProject?.id ?? "";
  const isPlatformAdmin = isSuperAdmin(authUser?.roles ?? []);

  const accessQuery = useProjectAccessQuery(projectId, {
    enabled: Boolean(projectId) && !isPlatformAdmin,
  });

  const value = useMemo<ProjectAccessContextValue>(() => {
    if (isPlatformAdmin) {
      return {
        projectPermissions: [],
        projectRoles: [],
        isLoading: false,
        isError: false,
        hasProjectContext: true,
      };
    }

    if (!projectId) {
      return {
        projectPermissions: [],
        projectRoles: [],
        isLoading: false,
        isError: false,
        hasProjectContext: false,
      };
    }

    return {
      projectPermissions: accessQuery.data?.permissions ?? [],
      projectRoles: accessQuery.data?.roles ?? [],
      isLoading: accessQuery.isPending,
      isError: accessQuery.isError,
      hasProjectContext: Boolean(accessQuery.data?.projectId),
    };
  }, [
    accessQuery.data,
    accessQuery.isError,
    accessQuery.isPending,
    isPlatformAdmin,
    projectId,
  ]);

  return (
    <ProjectAccessContext.Provider value={value}>{children}</ProjectAccessContext.Provider>
  );
}

export function useProjectAccess() {
  const ctx = useContext(ProjectAccessContext);
  if (!ctx) {
    throw new Error("useProjectAccess must be used within ProjectAccessProvider");
  }
  return ctx;
}
