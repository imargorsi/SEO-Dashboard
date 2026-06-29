import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"

// import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { ThemeToggle } from "@/components/ThemeToggle"
import { BreadcrumbBarShell } from "@/components/ui/breadcrumb"
import { useDashboardSidebar } from "@/context/DashboardSidebarContext"

type DashboardBreadcrumbBarProps = {
  children: ReactNode
}

/**
 * Full-width gradient strip: breadcrumb trail (left) + theme & language (right).
 */
export function DashboardBreadcrumbBar({ children }: DashboardBreadcrumbBarProps) {
  const sidebar = useDashboardSidebar()
  const { t: tNav } = useTranslation("translation", { keyPrefix: "nav" })

  return (
    <BreadcrumbBarShell>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          {sidebar && !sidebar.isSidebarOpen ? (
            <button
              type="button"
              onClick={() => sidebar.setSidebarOpen(true)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-h)] shadow-xs transition-colors hover:bg-[var(--accent-bg)] dark:border-white/35 dark:bg-[rgba(0,0,0,0.22)] dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] dark:hover:bg-white/15"
              aria-label={tNav("openMenu")}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-none stroke-current"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          ) : null}
          <div className="min-w-0 flex-1">{children}</div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle tone="default" size="xs" />
          {/* <LanguageSwitcher tone="inverse" size="xs" /> */}
        </div>
      </div>
    </BreadcrumbBarShell>
  )
}
