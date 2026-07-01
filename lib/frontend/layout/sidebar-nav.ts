import type { IconType } from "react-icons";
import {
  IoBarChartOutline,
  IoDocumentTextOutline,
  IoFolderOpenOutline,
  IoGridOutline,
  IoPeopleCircleOutline,
  IoPeopleOutline,
  IoSearchOutline,
  IoSettingsOutline,
  IoShieldOutline,
} from "react-icons/io5";

export type SidebarNavLabelKey =
  | "dashboard"
  | "projects"
  | "analytics"
  | "seoActivities"
  | "leads"
  | "reports"
  | "users"
  | "rolesPermissions"
  | "settings";

export type SidebarNavItem = {
  path: string;
  labelKey: SidebarNavLabelKey;
  icon: IconType;
  badge?: number;
  /** Extra path prefixes that mark this item active (e.g. `/permissions` for roles module). */
  matchPaths?: string[];
};

export const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  { path: "/dashboard", labelKey: "dashboard", icon: IoGridOutline },
  { path: "/projects", labelKey: "projects", icon: IoFolderOpenOutline },
  { path: "/analytics", labelKey: "analytics", icon: IoBarChartOutline },
  { path: "/seo-activities", labelKey: "seoActivities", icon: IoSearchOutline },
  { path: "/leads", labelKey: "leads", icon: IoPeopleOutline },
  { path: "/reports", labelKey: "reports", icon: IoDocumentTextOutline },
  { path: "/users", labelKey: "users", icon: IoPeopleCircleOutline },
  {
    path: "/roles",
    labelKey: "rolesPermissions",
    icon: IoShieldOutline,
    matchPaths: ["/permissions"],
  },
  { path: "/settings", labelKey: "settings", icon: IoSettingsOutline },
];

export function isSidebarNavItemActive(
  pathname: string,
  item: Pick<SidebarNavItem, "path" | "matchPaths">,
): boolean {
  const paths = [item.path, ...(item.matchPaths ?? [])];

  return paths.some((path) => {
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname === path || pathname.startsWith(`${path}/`);
  });
}
