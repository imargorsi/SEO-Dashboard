"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type DashboardBreadcrumbItem = {
  id?: string;
  label: ReactNode;
  href?: string;
};

type DashboardBreadcrumbContextValue = {
  overrideItems: DashboardBreadcrumbItem[] | null;
  setBreadcrumbOverride: (items: DashboardBreadcrumbItem[] | null) => void;
};

const DashboardBreadcrumbContext = createContext<DashboardBreadcrumbContextValue | null>(null);

export function breadcrumbKey(items: DashboardBreadcrumbItem[]): string {
  return items
    .map((item) => `${item.id ?? ""}:${item.href ?? ""}:${typeof item.label === "string" ? item.label : item.id ?? ""}`)
    .join("|");
}

export function DashboardBreadcrumbProvider({ children }: { children: ReactNode }) {
  const [overrideItems, setOverrideItems] = useState<DashboardBreadcrumbItem[] | null>(null);

  const setBreadcrumbOverride = useCallback((next: DashboardBreadcrumbItem[] | null) => {
    setOverrideItems((prev) => {
      if (next === null) return null;
      if (prev && breadcrumbKey(prev) === breadcrumbKey(next)) return prev;
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ overrideItems, setBreadcrumbOverride }),
    [overrideItems, setBreadcrumbOverride]
  );

  return (
    <DashboardBreadcrumbContext.Provider value={value}>{children}</DashboardBreadcrumbContext.Provider>
  );
}

export function useDashboardBreadcrumbs() {
  const ctx = useContext(DashboardBreadcrumbContext);
  if (!ctx) {
    throw new Error("useDashboardBreadcrumbs must be used within DashboardBreadcrumbProvider");
  }
  return ctx;
}
