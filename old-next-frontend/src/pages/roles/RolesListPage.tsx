import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { AlertCircle } from "lucide-react"
import { DashboardModuleBreadcrumbSection } from "@/components/layout/DashboardModuleBreadcrumbSection"
import { RolesTable } from "@/components/table/RolesTable"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuthUser } from "@/hooks/useAuthUser"
import type { RolesListLocationState } from "@/lib/admin/createRoleApi"
import { roleCanView } from "@/lib/admin/rolesAcl"

export function RolesListPage() {
  const { t } = useTranslation("translation", { keyPrefix: "modules.roles" })
  const { t: tCrumb } = useTranslation("translation", { keyPrefix: "breadcrumb" })
  const location = useLocation()
  const navigate = useNavigate()
  const authUser = useAuthUser()

  const canView = useMemo(
    () => roleCanView(authUser?.permissions),
    [authUser],
  )

  const listState = location.state as RolesListLocationState | null
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
          { id: "roles", label: t("title") },
        ]}
      />
      <div className="space-y-5 px-4 py-6 sm:px-6">
        {canView ? (
          <RolesTable initialFeedback={initialFeedback} />
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            <AlertTitle>{t("table.accessDeniedTitle")}</AlertTitle>
            <AlertDescription>{t("table.accessDeniedBody")}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
