import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { AlertCircle } from "lucide-react"
import { DashboardModuleBreadcrumbSection } from "@/components/layout/DashboardModuleBreadcrumbSection"
import {
  ProjectsTable,
  type ProjectsTableFeedback,
} from "@/components/table/ProjectsTable"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuthUser } from "@/hooks/useAuthUser"
import { projectCanView } from "@/lib/admin/projectsAcl"

export type ProjectsListLocationState = {
  feedback?: ProjectsTableFeedback
}

export function ProjectsListPage() {
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects" })
  const { t: tCrumb } = useTranslation("translation", { keyPrefix: "breadcrumb" })
  const location = useLocation()
  const navigate = useNavigate()
  const authUser = useAuthUser()

  const canView = useMemo(
    () => projectCanView(authUser?.permissions),
    [authUser],
  )

  const listState = location.state as ProjectsListLocationState | null
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
          { id: "projects", label: t("title") },
        ]}
      />
      <div className="space-y-5 px-4 py-6 sm:px-6">
        {canView ? (
          <ProjectsTable initialFeedback={initialFeedback} />
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
