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

import { useProjectsQuery, type TProjectListItem } from "@/features/projects/projects.api";

const STORAGE_KEY = "dashboard-selected-project-id";

type TSelectedProjectContextValue = {
  projects: TProjectListItem[];
  selectedProject: TProjectListItem | null;
  setSelectedProjectId: (id: string) => void;
  isLoading: boolean;
};

const SelectedProjectContext = createContext<TSelectedProjectContextValue | null>(null);

function resolveSelectedProjectId(projects: TProjectListItem[], storedId: string | null): string | null {
  if (projects.length === 0) return null;
  if (storedId && projects.some((project) => project.id === storedId)) return storedId;
  return null;
}

export function SelectedProjectProvider({ children }: { children: ReactNode }) {
  const { data: projects = [], isLoading } = useProjectsQuery();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || isLoading) return;

    const stored = localStorage.getItem(STORAGE_KEY);
    setSelectedId(resolveSelectedProjectId(projects, stored));
  }, [hydrated, isLoading, projects]);

  const setSelectedProjectId = useCallback(
    (id: string) => {
      if (!projects.some((project) => project.id === id)) return;
      setSelectedId(id);
      localStorage.setItem(STORAGE_KEY, id);
    },
    [projects],
  );

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedId) ?? null,
    [projects, selectedId],
  );

  const value = useMemo(
    () => ({
      projects,
      selectedProject,
      setSelectedProjectId,
      isLoading,
    }),
    [projects, selectedProject, setSelectedProjectId, isLoading],
  );

  return <SelectedProjectContext.Provider value={value}>{children}</SelectedProjectContext.Provider>;
}

export function useSelectedProject() {
  const ctx = useContext(SelectedProjectContext);
  if (!ctx) {
    throw new Error("useSelectedProject must be used within SelectedProjectProvider");
  }
  return ctx;
}
