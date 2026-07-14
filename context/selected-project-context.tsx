"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { useProjectsQuery, type TProjectListItem } from "@/features/projects/projects.api";

const STORAGE_KEY = "dashboard-selected-project-id";
const EMPTY_PROJECTS: TProjectListItem[] = [];

type TSelectedProjectContextValue = {
  projects: TProjectListItem[];
  selectedProject: TProjectListItem | null;
  setSelectedProjectId: (id: string) => void;
  /** Persist preference immediately (e.g. after accepting an invite) before the list refreshes. */
  preferSelectedProjectId: (id: string) => void;
  isLoading: boolean;
};

const SelectedProjectContext = createContext<TSelectedProjectContextValue | null>(null);

function subscribeStoredProjectId(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) onStoreChange();
  };

  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

function getStoredProjectId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerStoredProjectId(): string | null {
  return null;
}

function writeStoredProjectId(id: string | null) {
  try {
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* no-op */
  }
}

export function SelectedProjectProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useProjectsQuery();
  const projects: TProjectListItem[] = data ?? EMPTY_PROJECTS;

  const storedId = useSyncExternalStore(
    subscribeStoredProjectId,
    getStoredProjectId,
    getServerStoredProjectId,
  );
  const [preferredId, setPreferredId] = useState<string | null>(null);

  const effectivePreferredId = preferredId ?? storedId;

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === effectivePreferredId) ?? null,
    [projects, effectivePreferredId],
  );

  const setSelectedProjectId = useCallback(
    (id: string) => {
      if (!projects.some((project) => project.id === id)) return;
      writeStoredProjectId(id);
      setPreferredId(id);
    },
    [projects],
  );

  const preferSelectedProjectId = useCallback((id: string) => {
    writeStoredProjectId(id);
    setPreferredId(id);
  }, []);

  const value = useMemo(
    () => ({
      projects,
      selectedProject,
      setSelectedProjectId,
      preferSelectedProjectId,
      isLoading,
    }),
    [projects, selectedProject, setSelectedProjectId, preferSelectedProjectId, isLoading],
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
