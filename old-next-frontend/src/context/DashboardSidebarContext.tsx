import { createContext, useContext } from "react"

export type DashboardSidebarContextValue = {
  isSidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const DashboardSidebarContext =
  createContext<DashboardSidebarContextValue | null>(null)

export function useDashboardSidebar() {
  return useContext(DashboardSidebarContext)
}
