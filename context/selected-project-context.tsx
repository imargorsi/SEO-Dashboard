"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  DUMMY_WORKSPACE_PROJECTS,
  getWorkspaceProjectById,
  type WorkspaceProject,
} from "@/lib/dummy-data/workspace-projects";

const STORAGE_KEY = "dashboard-selected-project-id";

type SelectedProjectContextValue = {
  projects: WorkspaceProject[];
  selectedProject: WorkspaceProject;
  setSelectedProjectId: (id: string) => void;
};

const SelectedProjectContext = createContext<SelectedProjectContextValue | null>(null);

function readStoredProjectId(): string {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && getWorkspaceProjectById(stored)) return stored;
  return DUMMY_WORKSPACE_PROJECTS[0].id;
}

export function SelectedProjectProvider({ children }: { children: ReactNode }) {
  const [selectedId, setSelectedId] = useState(DUMMY_WORKSPACE_PROJECTS[0].id);

  useEffect(() => {
    setSelectedId(readStoredProjectId());
  }, []);

  const setSelectedProjectId = useCallback((id: string) => {
    if (!getWorkspaceProjectById(id)) return;
    setSelectedId(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const selectedProject = getWorkspaceProjectById(selectedId) ?? DUMMY_WORKSPACE_PROJECTS[0];

  const value = useMemo(
    () => ({
      projects: DUMMY_WORKSPACE_PROJECTS,
      selectedProject,
      setSelectedProjectId,
    }),
    [selectedProject, setSelectedProjectId]
  );

  return (
    <SelectedProjectContext.Provider value={value}>{children}</SelectedProjectContext.Provider>
  );
}

export function useSelectedProject() {
  const ctx = useContext(SelectedProjectContext);
  if (!ctx) {
    throw new Error("useSelectedProject must be used within SelectedProjectProvider");
  }
  return ctx;
}
