"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoClose } from "react-icons/io5";

import { EmailVerificationBanner } from "@/components/auth/email-verification-banner";
import { SidebarUserProfile } from "@/components/layout/sidebar-user-profile";
import { DashboardSidebarProvider } from "@/context/dashboard-sidebar-context";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { buildSidebarNavFromPermissions } from "@/lib/frontend/auth/permission-nav";
import { cn } from "@/lib/utils";

const navClass =
  "block w-full px-4 py-2 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--accent-bg)] hover:text-[var(--text-h)]";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { t: tNav } = useTranslation("translation", { keyPrefix: "nav" });
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { data: authUser } = useAuthUserQuery();

  const sidebarNav = useMemo(
    () => buildSidebarNavFromPermissions(authUser?.permissions ?? [], authUser?.roles ?? []),
    [authUser?.permissions, authUser?.roles]
  );

  return (
    <DashboardSidebarProvider value={{ isSidebarOpen, setSidebarOpen: setIsSidebarOpen }}>
      <div className="flex min-h-svh flex-col md:flex-row">
        {isSidebarOpen ? (
          <aside
            className="flex shrink-0 flex-col border-b border-[var(--border)] bg-[var(--social-bg)] md:min-h-svh md:w-56 md:border-b-0 md:border-e"
            aria-label={tNav("aria")}
          >
            <div className="flex shrink-0 items-center gap-2 px-4 pt-2.5 pb-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text)]/70">
                {tNav("modules")}
              </p>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="ms-auto inline-flex size-7 shrink-0 items-center justify-center rounded-md text-[var(--text)]/55 transition-colors hover:bg-[var(--accent-bg)] hover:text-[var(--text-h)] active:scale-95"
                aria-label={tNav("closeMenu")}
              >
                <IoClose className="size-3.5" strokeWidth={2.25} aria-hidden />
              </button>
            </div>
            <nav className="flex min-h-0 flex-1 flex-col gap-px overflow-y-auto pb-2">
              {sidebarNav.map((item) => {
                const isActive =
                  item.path === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname === item.path || pathname.startsWith(`${item.path}/`);

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={cn(
                      navClass,
                      isActive &&
                        "bg-[color-mix(in_srgb,var(--accent-bg)_100%,var(--brand)_18%)] font-semibold text-[var(--text-h)]"
                    )}
                  >
                    {tNav(item.labelKey)}
                  </Link>
                );
              })}
            </nav>
            <div className="shrink-0 border-t border-[var(--border)] p-2">
              <SidebarUserProfile />
            </div>
          </aside>
        ) : null}
        <div className="relative flex min-w-0 flex-1 flex-col">
          <EmailVerificationBanner />
          <main className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</main>
        </div>
      </div>
    </DashboardSidebarProvider>
  );
}
