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
  isSidebarNavItemActive,
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

  const showProjectSelector = user
    ? hasProjectWorkspace(user.permissions, projectPermissions, user.roles)
    : false;

  return (
    <aside className={sidebarShellClass} aria-label={tNav("aria")}>
      <div className={sidebarBrandRowClass}>
        <Link
          href="/dashboard"
          className="flex w-full min-w-0 items-center justify-start rounded-lg px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-border) focus-visible:ring-offset-2 focus-visible:ring-offset-bg-sidebar"
          aria-label={tLayout("appName")}
        >
          <Image
            src="/Logo.svg"
            alt=""
            width={60}
            height={24}
            priority
            className="h-8 w-auto shrink-0"
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
        <ul className="flex flex-col gap-1" role="list">
          {navItems.map((item) => {
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
                      isActive ? "text-text-primary" : "text-text-muted group-hover:text-text-primary"
                    )}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate type-body-strong">{tNav(item.labelKey)}</span>
                  {item.badge != null ? (
                    <span
                      className={cn(
                        "ms-auto inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 py-0.5 type-overline",
                        isActive
                          ? "bg-bg-hover text-text-primary"
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
      </nav>

      <div className="shrink-0 border-t border-border px-3 py-3">
        <NavbarProfileMenu placement="sidebar" />
      </div>
    </aside>
  );
}
