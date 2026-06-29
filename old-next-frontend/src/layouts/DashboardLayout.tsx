import { NavLink, Outlet } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { X } from "lucide-react"
import { tryFetchAndStoreAuthUser } from "@/lib/auth/fetchSessionUser.ts"
import { buildSidebarNavFromPermissions } from "@/lib/auth/permissionNav"
import { useAuthUser } from "@/hooks/useAuthUser"
import { DashboardSidebarContext } from "@/context/DashboardSidebarContext"
import { SidebarUserProfile } from "../components/layout/SidebarUserProfile.tsx"

const navClass =
  "block w-full px-4 py-2 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--accent-bg)] hover:text-[var(--text-h)]"

function navActiveClass({ isActive }: { isActive: boolean }) {
  return [
    navClass,
    isActive
      ? "bg-[color-mix(in_srgb,var(--accent-bg)_100%,var(--brand)_18%)] text-[var(--text-h)] font-semibold"
      : "",
  ]
    .filter(Boolean)
    .join(" ")
}

export function DashboardLayout() {
  const { t: tNav } = useTranslation("translation", { keyPrefix: "nav" })
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const authUser = useAuthUser()
  const sidebarNav = useMemo(
    () =>
      buildSidebarNavFromPermissions(
        authUser?.permissions ?? [],
        authUser?.roles ?? [],
      ),
    [authUser?.permissions, authUser?.roles],
  )

  useEffect(() => {
    void tryFetchAndStoreAuthUser()
  }, [])

  return (
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
              <X className="size-3.5" strokeWidth={2.25} aria-hidden />
            </button>
          </div>
          <nav className="flex min-h-0 flex-1 flex-col gap-px overflow-y-auto pb-2">
            {sidebarNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                className={navActiveClass}
              >
                {tNav(item.labelKey)}
              </NavLink>
            ))}
          </nav>
          <div className="shrink-0 border-t border-[var(--border)] p-2">
            <SidebarUserProfile />
          </div>
        </aside>
      ) : null}
      <DashboardSidebarContext.Provider
        value={{ isSidebarOpen, setSidebarOpen: setIsSidebarOpen }}
      >
        <div className="relative flex min-w-0 flex-1 flex-col">
          <main className="flex min-h-0 min-w-0 flex-1 flex-col">
            <Outlet />
          </main>
        </div>
      </DashboardSidebarContext.Provider>
    </div>
  )
}
