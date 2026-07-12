"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import { useSelectedProject } from "@/context/selected-project-context";

type ProjectAccessContextValue = {
  /** Permissions for the active project — populated via API in Module 6. */
  projectPermissions: string[];
  isLoading: boolean;
};

const ProjectAccessContext = createContext<ProjectAccessContextValue | null>(null);

/**
 * Holds per-project permissions for the sidebar selector.
 * Returns an empty list until `GET /api/v1/projects/{id}/access` is wired.
 */
export function ProjectAccessProvider({ children }: { children: ReactNode }) {
  const { selectedProject } = useSelectedProject();

  const value = useMemo<ProjectAccessContextValue>(
    () => ({
      projectPermissions: [],
      isLoading: false,
    }),
    [selectedProject?.id],
  );

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
