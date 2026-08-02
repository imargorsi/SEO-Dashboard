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

export type SidebarNavGroupId = "general" | "reporting" | "settings";

export type SidebarNavItem = {
  path: string;
  labelKey: SidebarNavLabelKey;
  icon: IconType;
  badge?: number;
  /** Extra path prefixes that mark this item active (e.g. `/permissions` for roles module). */
  matchPaths?: string[];
};

export type SidebarNavDefinition = SidebarNavItem & {
  /** `.view` permission required; `null` = always visible (e.g. settings). */
  viewPermission: string | null;
  permissionScope: "platform" | "project";
  group: SidebarNavGroupId;
};

export type SidebarNavGroup = {
  id: SidebarNavGroupId;
  items: SidebarNavItem[];
};

export const SIDEBAR_NAV_GROUP_ORDER: readonly SidebarNavGroupId[] = [
  "general",
  "reporting",
  "settings",
] as const;

/** Same nav for all roles — visibility is permission-driven. */
export const SIDEBAR_NAV_DEFINITIONS: readonly SidebarNavDefinition[] = [
  {
    path: "/dashboard",
    labelKey: "dashboard",
    icon: IoSpeedometerOutline,
    viewPermission: "dashboard.view",
    permissionScope: "project",
    group: "general",
  },
  {
    path: "/projects",
    labelKey: "projects",
    icon: IoBriefcaseOutline,
    viewPermission: null,
    permissionScope: "project",
    group: "general",
  },
  {
    path: "/users",
    labelKey: "users",
    icon: IoPersonCircleOutline,
    viewPermission: "admin.users.view",
    permissionScope: "platform",
    group: "general",
  },
  {
    path: "/roles",
    labelKey: "rolesPermissions",
    icon: IoShieldCheckmarkOutline,
    viewPermission: "admin.roles.view",
    permissionScope: "platform",
    group: "general",
  },
  {
    path: "/analytics",
    labelKey: "analytics",
    icon: IoAnalyticsOutline,
    viewPermission: "analytics.view",
    permissionScope: "project",
    group: "reporting",
  },
  {
    path: "/leads",
    labelKey: "leads",
    icon: IoPeopleOutline,
    viewPermission: "leads.view",
    permissionScope: "project",
    group: "reporting",
  },
  {
    path: "/seo-activities",
    labelKey: "seoActivities",
    icon: IoRocketOutline,
    viewPermission: "seo_activities.view",
    permissionScope: "project",
    group: "reporting",
  },
  {
    path: "/reports",
    labelKey: "reports",
    icon: IoNewspaperOutline,
    viewPermission: "reports.view",
    permissionScope: "project",
    group: "reporting",
  },
  {
    path: "/settings",
    labelKey: "settings",
    icon: IoOptionsOutline,
    viewPermission: null,
    permissionScope: "platform",
    group: "settings",
  },
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
