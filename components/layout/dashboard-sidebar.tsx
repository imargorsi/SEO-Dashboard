"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { IoClose } from "react-icons/io5";

import { NavbarProfileMenu } from "@/components/layout/navbar-profile-menu";
import { ProjectSelector } from "@/components/layout/project-selector";
import { useProjectAccess } from "@/context/project-access-context";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { buildSidebarNavItems, hasProjectWorkspace } from "@/lib/frontend/layout/build-sidebar-nav";
import {
  SIDEBAR_NAV_GROUP_ORDER,
  isSidebarNavItemActive,
  type SidebarNavGroup,
  type SidebarNavItem,
} from "@/lib/frontend/layout/sidebar-nav";
import {
  sidebarBrandRowClass,
  sidebarNavLinkActiveClass,
  sidebarNavLinkClass,
  sidebarNavLinkInactiveClass,
  sidebarShellClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

type DashboardSidebarProps = {
  onClose?: () => void;
};

const GROUP_LABEL_KEY: Record<SidebarNavGroup, "sectionGeneral" | "sectionMySpace"> = {
  general: "sectionGeneral",
  mySpace: "sectionMySpace",
};

function groupNavItems(items: SidebarNavItem[]) {
  return SIDEBAR_NAV_GROUP_ORDER.map((group) => ({
    group,
    items: items.filter((item) => item.group === group),
  })).filter((section) => section.items.length > 0);
}

export function DashboardSidebar({ onClose }: DashboardSidebarProps) {
  const { t: tNav } = useTranslation("translation", { keyPrefix: "nav" });
  const { t: tLayout } = useTranslation("translation", { keyPrefix: "layout" });
  const pathname = usePathname();
  const { data: user } = useAuthUserQuery();
  const { projectPermissions } = useProjectAccess();

  const navItems = useMemo(() => {
    if (!user) return [];
    return buildSidebarNavItems(user.permissions, projectPermissions, user.roles);
  }, [projectPermissions, user]);

  const navSections = useMemo(() => groupNavItems(navItems), [navItems]);

  const showProjectSelector = user
    ? hasProjectWorkspace(user.permissions, projectPermissions, user.roles)
    : false;

  return (
    <aside className={sidebarShellClass} aria-label={tNav("aria")}>
      <div className={sidebarBrandRowClass}>
        <Link
          href="/dashboard"
          className="flex w-full min-w-0 items-center justify-center rounded-lg px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-border) focus-visible:ring-offset-2 focus-visible:ring-offset-bg-sidebar"
          aria-label={tLayout("appName")}
        >
          <Image
            src="/logo.svg"
            alt=""
            width={180}
            height={180}
            priority
            className="shrink-0"
            aria-hidden
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

      {showProjectSelector ? <ProjectSelector /> : null}

      <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-5 pt-1">
        {navSections.map((section) => (
          <div key={section.group} className="mt-3 first:mt-1">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
              {tNav(GROUP_LABEL_KEY[section.group])}
            </p>
            <ul className="flex flex-col gap-1" role="list">
              {section.items.map((item) => {
                const isActive = isSidebarNavItemActive(pathname, item);
                const Icon = item.icon;

                return (
                  <li key={item.labelKey}>
                    <Link
                      href={item.path}
                      className={cn(
                        sidebarNavLinkClass,
                        isActive ? sidebarNavLinkActiveClass : sidebarNavLinkInactiveClass
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-[18px] shrink-0 transition-colors",
                          isActive
                            ? "text-text-on-brand"
                            : "text-text-muted group-hover:text-text-on-brand"
                        )}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1 truncate">{tNav(item.labelKey)}</span>
                      {item.badge != null ? (
                        <span
                          className={cn(
                            "ms-auto inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                            isActive
                              ? "bg-text-on-brand/20 text-text-on-brand"
                              : "bg-destructive text-text-on-brand"
                          )}
                        >
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-border px-3 py-3">
        <NavbarProfileMenu placement="sidebar" />
      </div>
    </aside>
  );
}
