"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { IoClose } from "react-icons/io5";

import { ProjectSelector } from "@/components/layout/project-selector";
import { useProjectAccess } from "@/context/project-access-context";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { buildSidebarNavItems, hasProjectWorkspace } from "@/lib/frontend/layout/build-sidebar-nav";
import { isSidebarNavItemActive } from "@/lib/frontend/layout/sidebar-nav";
import { dashboardHeaderRowClass, dashboardHeaderTitleClass } from "@/lib/frontend/layout/dashboard-chrome";
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
    <aside
      className="flex w-full shrink-0 flex-col border-b border-[var(--border)] bg-[var(--bg-elevated)] md:min-h-svh md:w-60 md:border-b-0 md:border-e"
      aria-label={tNav("aria")}
    >
      <div className={cn(dashboardHeaderRowClass, "px-4")}>
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-bg)] text-[var(--brand)]"
            aria-hidden
          >
            <svg viewBox="0 0 24 24" className="size-4 fill-current">
              <path d="M12 2 4 6.5v11L12 22l8-4.5v-11L12 2zm0 2.18 5.5 3.09v6.46L12 17.82l-5.5-3.09V7.27L12 4.18z" />
            </svg>
          </span>
          <p className={cn("truncate", dashboardHeaderTitleClass)}>
            {tLayout("appName")}
          </p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--accent-bg)] hover:text-[var(--text-h)] md:hidden"
            aria-label={tNav("closeMenu")}
          >
            <IoClose className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>

      {showProjectSelector ? <ProjectSelector /> : null}

      <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-4 pt-1">
        <ul className="flex flex-col gap-0.5" role="list">
          {navItems.map((item) => {
            const isActive = isSidebarNavItemActive(pathname, item);
            const Icon = item.icon;

            return (
              <li key={item.labelKey}>
                <Link
                  href={item.path}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                    isActive
                      ? "bg-[var(--accent-bg)] font-semibold text-[var(--text-h)]"
                      : "text-[var(--text)] hover:bg-[var(--accent-bg)] hover:text-[var(--text-h)]"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-[18px] shrink-0 transition-colors",
                      isActive ? "text-[var(--brand)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-h)]"
                    )}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate">{tNav(item.labelKey)}</span>
                  {item.badge != null ? (
                    <span className="ms-auto inline-flex min-w-[18px] items-center justify-center rounded-full bg-[var(--destructive-muted)] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
