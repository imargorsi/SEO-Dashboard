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
    icon: IoGridOutline,
    group: "general",
    viewPermission: "dashboard.view",
    permissionScope: "project",
  },
  {
    path: "/projects",
    labelKey: "projects",
    icon: IoFolderOpenOutline,
    group: "general",
    viewPermission: null,
    permissionScope: "project",
  },
  {
    path: "/analytics",
    labelKey: "analytics",
    icon: IoBarChartOutline,
    group: "general",
    viewPermission: "analytics.view",
    permissionScope: "project",
  },
  {
    path: "/seo-activities",
    labelKey: "seoActivities",
    icon: IoSearchOutline,
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
    icon: IoDocumentTextOutline,
    group: "general",
    viewPermission: "reports.view",
    permissionScope: "project",
  },
  {
    path: "/users",
    labelKey: "users",
    icon: IoPeopleCircleOutline,
    group: "mySpace",
    viewPermission: "admin.users.view",
    permissionScope: "platform",
  },
  {
    path: "/roles",
    labelKey: "rolesPermissions",
    icon: IoShieldOutline,
    group: "mySpace",
    viewPermission: "admin.roles.view",
    permissionScope: "platform",
  },
  {
    path: "/settings",
    labelKey: "settings",
    icon: IoSettingsOutline,
    group: "mySpace",
    viewPermission: null,
    permissionScope: "platform",
    matchPaths: ["/settings"],
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
