"use client";

import { createContext, useContext } from "react";

type DashboardSidebarContextValue = {
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

const DashboardSidebarContext = createContext<DashboardSidebarContextValue | null>(null);

export function DashboardSidebarProvider({
  value,
  children,
}: {
  value: DashboardSidebarContextValue;
  children: React.ReactNode;
}) {
  return <DashboardSidebarContext.Provider value={value}>{children}</DashboardSidebarContext.Provider>;
}

export function useDashboardSidebar() {
  return useContext(DashboardSidebarContext);
}
