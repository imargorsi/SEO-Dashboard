"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type DashboardBreadcrumbItem = {
  id?: string;
  label: ReactNode;
  href?: string;
};

type DashboardBreadcrumbContextValue = {
  items: DashboardBreadcrumbItem[];
  setBreadcrumbs: (items: DashboardBreadcrumbItem[]) => void;
};

const DashboardBreadcrumbContext = createContext<DashboardBreadcrumbContextValue | null>(null);

export function breadcrumbKey(items: DashboardBreadcrumbItem[]): string {
  return items
    .map((item) => `${item.id ?? ""}:${item.href ?? ""}:${typeof item.label === "string" ? item.label : item.id ?? ""}`)
    .join("|");
}

export function DashboardBreadcrumbProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<DashboardBreadcrumbItem[]>([]);

  const setBreadcrumbs = useCallback((next: DashboardBreadcrumbItem[]) => {
    setItems((prev) => {
      if (breadcrumbKey(prev) === breadcrumbKey(next)) return prev;
      return next;
    });
  }, []);

  const value = useMemo(() => ({ items, setBreadcrumbs }), [items, setBreadcrumbs]);

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
