import type { IconType } from "react-icons";
import {
  IoAnalyticsOutline,
  IoBriefcaseOutline,
  IoNewspaperOutline,
  IoOptionsOutline,
  IoPeopleOutline,
  IoPersonCircleOutline,
  IoRocketOutline,
  IoShieldCheckmarkOutline,
  IoSpeedometerOutline,
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

export type SidebarNavGroup = "general" | "mySpace";

export type SidebarNavItem = {
  path: string;
  labelKey: SidebarNavLabelKey;
  icon: IconType;
  group: SidebarNavGroup;
  badge?: number;
  /** Extra path prefixes that mark this item active (e.g. `/permissions` for roles module). */
  matchPaths?: string[];
};

export type SidebarNavDefinition = SidebarNavItem & {
  /** `.view` permission required; `null` = always visible (e.g. settings). */
  viewPermission: string | null;
  permissionScope: "platform" | "project";
};

/** Same nav for all roles — visibility is permission-driven. */
export const SIDEBAR_NAV_DEFINITIONS: readonly SidebarNavDefinition[] = [
  {
    path: "/dashboard",
    labelKey: "dashboard",
    icon: IoSpeedometerOutline,
    group: "general",
    viewPermission: "dashboard.view",
    permissionScope: "project",
  },
  {
    path: "/projects",
    labelKey: "projects",
    icon: IoBriefcaseOutline,
    group: "general",
    viewPermission: null,
    permissionScope: "project",
  },
  {
    path: "/analytics",
    labelKey: "analytics",
    icon: IoAnalyticsOutline,
    group: "general",
    viewPermission: "analytics.view",
    permissionScope: "project",
  },
  {
    path: "/seo-activities",
    labelKey: "seoActivities",
    icon: IoRocketOutline,
    group: "general",
    viewPermission: "seo_activities.view",
    permissionScope: "project",
  },
  {
    path: "/leads",
    labelKey: "leads",
    icon: IoPeopleOutline,
    group: "general",
    viewPermission: "leads.view",
    permissionScope: "project",
  },
  {
    path: "/reports",
    labelKey: "reports",
    icon: IoNewspaperOutline,
    group: "general",
    viewPermission: "reports.view",
    permissionScope: "project",
  },
  {
    path: "/users",
    labelKey: "users",
    icon: IoPersonCircleOutline,
    group: "mySpace",
    viewPermission: "admin.users.view",
    permissionScope: "platform",
  },
  {
    path: "/roles",
    labelKey: "rolesPermissions",
    icon: IoShieldCheckmarkOutline,
    group: "mySpace",
    viewPermission: "admin.roles.view",
    permissionScope: "platform",
  },
  {
    path: "/settings",
    labelKey: "settings",
    icon: IoOptionsOutline,
    group: "mySpace",
    viewPermission: null,
    permissionScope: "platform",
  },
];

export const SIDEBAR_NAV_GROUP_ORDER: readonly SidebarNavGroup[] = ["general", "mySpace"];

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
