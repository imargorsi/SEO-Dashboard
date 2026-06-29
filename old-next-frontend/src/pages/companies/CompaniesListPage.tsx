import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { DashboardModuleBreadcrumbSection } from "@/components/layout/DashboardModuleBreadcrumbSection"
import { CompaniesTable } from "@/components/table/CompaniesTable"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuthUser } from "@/hooks/useAuthUser"
import { companyCanView } from "@/lib/admin/companiesAcl"
import type { CompaniesListLocationState } from "@/lib/admin/companyFormMapper"
import { AlertCircle } from "lucide-react"

export function CompaniesListPage() {
  const { t } = useTranslation("translation", { keyPrefix: "modules.companies" })
  const { t: tCrumb } = useTranslation("translation", { keyPrefix: "breadcrumb" })
  const location = useLocation()
  const navigate = useNavigate()
  const authUser = useAuthUser()

  const canView = useMemo(
    () => companyCanView(authUser?.permissions),
    [authUser],
  )

  const listState = location.state as CompaniesListLocationState | null
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
          { id: "companies", label: t("title") },
        ]}
      />
      <div className="space-y-5 px-4 py-6 sm:px-6">
        {canView ? (
          <CompaniesTable initialFeedback={initialFeedback} />
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
