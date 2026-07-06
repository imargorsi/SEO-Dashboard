"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import { DashboardNavbarActions } from "@/components/layout/dashboard-navbar-actions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  breadcrumbLinkClassName,
} from "@/components/ui/breadcrumb";
import { useDashboardBreadcrumbs } from "@/context/dashboard-breadcrumb-context";
import { breadcrumbsFromPathname } from "@/lib/frontend/layout/dashboard-breadcrumbs";
import {
  dashboardHeaderRowClass,
  dashboardNavIconClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import { useDashboardSidebar } from "@/context/dashboard-sidebar-context";
import { cn } from "@/lib/utils";

export function DashboardTopBar() {
  const sidebar = useDashboardSidebar();
  const pathname = usePathname();
  const { overrideItems } = useDashboardBreadcrumbs();
  const { t } = useTranslation("translation");
  const { t: tNav } = useTranslation("translation", { keyPrefix: "nav" });

  const items =
    overrideItems ?? breadcrumbsFromPathname(pathname, (key) => String(t(key as never)));

  return (
    <header className="relative z-10 w-full shrink-0 bg-[var(--bg-elevated)]">
      <div className={cn(dashboardHeaderRowClass, "px-4 sm:px-6")}>
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          {sidebar && !sidebar.isSidebarOpen ? (
            <button
              type="button"
              onClick={() => sidebar.setSidebarOpen(true)}
              className={dashboardNavIconClass}
              aria-label={tNav("openMenu")}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-5 fill-none stroke-current"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          ) : null}
          <div className="flex min-w-0 flex-1 items-center">
            {items.length > 0 ? (
              <Breadcrumb>
                <BreadcrumbList>
                  {items.map((item, index) => (
                    <Fragment key={item.id ?? String(index)}>
                      {index > 0 ? <BreadcrumbSeparator /> : null}
                      <BreadcrumbItem>
                        {item.href ? (
                          <Link href={item.href} className={breadcrumbLinkClassName}>
                            {item.label}
                          </Link>
                        ) : (
                          <BreadcrumbPage>{item.label}</BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                    </Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            ) : null}
          </div>
        </div>
        <DashboardNavbarActions />
      </div>
    </header>
  );
}
