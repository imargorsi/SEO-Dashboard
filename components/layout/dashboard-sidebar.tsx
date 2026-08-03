"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { IoChevronBack, IoChevronForward, IoClose } from "react-icons/io5";

import { NavbarProfileMenu } from "@/components/layout/navbar-profile-menu";
import { AppLogo } from "@/components/layout/app-logo";
import { ProjectSelector } from "@/components/layout/project-selector";
import { useDashboardSidebar } from "@/context/dashboard-sidebar-context";
import { useProjectAccess } from "@/context/project-access-context";
import { useSelectedProject } from "@/context/selected-project-context";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { buildSidebarNavGroups } from "@/lib/frontend/layout/build-sidebar-nav";
import {
  isSidebarNavItemActive,
  type SidebarNavGroupId,
  type SidebarNavItem,
} from "@/lib/frontend/layout/sidebar-nav";
import {
  sidebarBrandRowClass,
  sidebarBrandRowCollapsedClass,
  sidebarCollapseToggleClass,
  sidebarCollapseToggleCollapsedClass,
  sidebarNavGroupClass,
  sidebarNavGroupLabelClass,
  sidebarNavIconWellActiveClass,
  sidebarNavIconWellClass,
  sidebarNavIconWellInactiveClass,
  sidebarNavLinkActiveClass,
  sidebarNavLinkClass,
  sidebarNavLinkCollapsedClass,
  sidebarNavLinkInactiveClass,
  sidebarShellClass,
  sidebarShellCollapsedClass,
  sidebarShellExpandedClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import { isSuperAdmin } from "@/lib/rbac/access";
import { cn } from "@/lib/utils";

const GROUP_LABEL_KEY: Record<SidebarNavGroupId, "groupGeneral" | "groupReporting" | "groupSettings"> = {
  general: "groupGeneral",
  reporting: "groupReporting",
  settings: "groupSettings",
};

type DashboardSidebarProps = {
  onClose?: () => void;
};

function SidebarNavLink({
  item,
  isCollapsed,
  pathname,
  label,
}: {
  item: SidebarNavItem;
  isCollapsed: boolean;
  pathname: string;
  label: string;
}) {
  const isActive = isSidebarNavItemActive(pathname, item);
  const Icon = item.icon;

  return (
    <Link
      href={item.path}
      title={isCollapsed ? label : undefined}
      aria-label={isCollapsed ? label : undefined}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        sidebarNavLinkClass,
        isCollapsed && sidebarNavLinkCollapsedClass,
        isActive ? sidebarNavLinkActiveClass : sidebarNavLinkInactiveClass,
      )}
    >
      <span
        className={cn(
          sidebarNavIconWellClass,
          isActive ? sidebarNavIconWellActiveClass : sidebarNavIconWellInactiveClass,
        )}
      >
        <Icon className="size-3.5" aria-hidden />
      </span>
      <span className={cn("min-w-0 flex-1 truncate", isCollapsed && "md:hidden")}>{label}</span>
      {item.badge != null ? (
        <span
          className={cn(
            "ms-auto inline-flex min-w-4.5 items-center justify-center rounded-full px-1.5 py-0.5 type-overline",
            isCollapsed && "md:hidden",
            isActive
              ? "bg-text-on-brand/20 text-text-on-brand"
              : "bg-destructive text-text-on-brand",
          )}
        >
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

export function DashboardSidebar({ onClose }: DashboardSidebarProps) {
  const { t: tNav } = useTranslation("translation", { keyPrefix: "nav" });
  const { t: tLayout } = useTranslation("translation", { keyPrefix: "layout" });
  const pathname = usePathname();
  const { data: user } = useAuthUserQuery();
  const { projects } = useSelectedProject();
  const { projectPermissions, hasProjectContext, isLoading: isProjectAccessLoading } = useProjectAccess();
  const sidebar = useDashboardSidebar();
  const isCollapsed = Boolean(sidebar?.isSidebarCollapsed);

  const isPlatformAdmin = user ? isSuperAdmin(user.roles) : false;
  const showProjectSelector = Boolean(user && (projects.length > 0 || isPlatformAdmin));

  const canRenderNav = useMemo(() => {
    if (!user) return false;
    if (isPlatformAdmin) return true;
    return hasProjectContext && !isProjectAccessLoading;
  }, [hasProjectContext, isPlatformAdmin, isProjectAccessLoading, user]);

  const navGroups = useMemo(() => {
    if (!user || !canRenderNav) return [];
    return buildSidebarNavGroups(user.permissions, projectPermissions, user.roles);
  }, [canRenderNav, projectPermissions, user]);

  const collapseLabel = isCollapsed ? tNav("expandSidebar") : tNav("collapseSidebar");

  return (
    <aside
      className={cn(
        sidebarShellClass,
        isCollapsed ? sidebarShellCollapsedClass : sidebarShellExpandedClass,
      )}
      aria-label={tNav("aria")}
      data-collapsed={isCollapsed ? "true" : "false"}
    >
      <div className={cn(sidebarBrandRowClass, isCollapsed && sidebarBrandRowCollapsedClass)}>
        <Link
          href="/dashboard"
          className={cn(
            "flex min-w-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-border) focus-visible:ring-offset-2 focus-visible:ring-offset-bg-sidebar",
            isCollapsed ? "w-auto justify-center px-1" : "w-full justify-center",
            onClose && !isCollapsed && "pe-10",
          )}
          aria-label={tLayout("appName")}
        >
          <AppLogo
            priority
            variant={isCollapsed ? "mark" : "full"}
            className={cn(
              isCollapsed ? "size-7 shrink-0" : "mx-auto h-8 w-auto max-w-full",
            )}
            width={isCollapsed ? 28 : 160}
            height={isCollapsed ? 28 : 24}
          />
        </Link>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="absolute inset-e-4 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary md:hidden"
            aria-label={tNav("closeMenu")}
          >
            <IoClose className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>

      {showProjectSelector ? <ProjectSelector isCollapsed={isCollapsed} /> : null}

      <nav className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto pb-3 pt-2", isCollapsed ? "px-2" : "px-3")}>
        <div className="flex flex-col">
          {navGroups.map((group) => (
            <div key={group.id} className={sidebarNavGroupClass}>
              <p className={cn(sidebarNavGroupLabelClass, isCollapsed && "md:sr-only")}>
                {tNav(GROUP_LABEL_KEY[group.id])}
              </p>
              <ul className="flex flex-col gap-1" role="list">
                {group.items.map((item) => (
                  <li key={item.labelKey}>
                    <SidebarNavLink
                      item={item}
                      isCollapsed={isCollapsed}
                      pathname={pathname}
                      label={tNav(item.labelKey)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {sidebar ? (
          <div className="mt-auto pt-3">
            <button
              type="button"
              onClick={sidebar.toggleSidebarCollapsed}
              className={cn(
                sidebarCollapseToggleClass,
                isCollapsed && sidebarCollapseToggleCollapsedClass,
              )}
              aria-label={collapseLabel}
              aria-expanded={!isCollapsed}
              title={collapseLabel}
            >
              <span className={cn(sidebarNavIconWellClass, sidebarNavIconWellInactiveClass)}>
                {isCollapsed ? (
                  <IoChevronForward className="size-3.5 rtl:rotate-180" aria-hidden />
                ) : (
                  <IoChevronBack className="size-3.5 rtl:rotate-180" aria-hidden />
                )}
              </span>
              <span className={cn("min-w-0 flex-1 truncate text-start", isCollapsed && "md:hidden")}>
                {collapseLabel}
              </span>
            </button>
          </div>
        ) : null}
      </nav>

      <div className={cn("shrink-0 border-t border-border py-3", isCollapsed ? "px-2" : "px-3")}>
        <NavbarProfileMenu placement="sidebar" isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
}
