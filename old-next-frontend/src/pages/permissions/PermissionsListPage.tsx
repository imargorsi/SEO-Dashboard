import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { DashboardModuleBreadcrumbSection } from "@/components/layout/DashboardModuleBreadcrumbSection"
import { PermissionsTable } from "@/components/table/PermissionsTable"
import type { PermissionsListLocationState } from "@/lib/admin/createPermissionApi"

export function PermissionsListPage() {
  const { t } = useTranslation("translation", {
    keyPrefix: "modules.permissions",
  })
  const { t: tCrumb } = useTranslation("translation", { keyPrefix: "breadcrumb" })
  const location = useLocation()
  const navigate = useNavigate()

  const listState = location.state as PermissionsListLocationState | null
  const initialFeedback = listState?.feedback ?? null

  useEffect(() => {
    if (!initialFeedback) return
    navigate(location.pathname, { replace: true, state: null })
  }, [initialFeedback, location.pathname, navigate])

  return (
    <div className="w-full min-w-0">
      <DashboardModuleBreadcrumbSection
        items={[
          { id: "root", label: tCrumb("root"), to: "/dashboard" },
          { id: "permissions", label: t("title") },
        ]}
      />
      <div className="space-y-5 px-4 py-6 sm:px-6">
        <PermissionsTable initialFeedback={initialFeedback} />
      </div>
    </div>
  )
}
