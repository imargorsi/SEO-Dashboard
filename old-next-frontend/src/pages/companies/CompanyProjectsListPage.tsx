import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { AlertCircle } from "lucide-react"
import { DashboardModuleBreadcrumbSection } from "@/components/layout/DashboardModuleBreadcrumbSection"
import {
  ProjectsTable,
  type ProjectsTableFeedback,
} from "@/components/table/ProjectsTable"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuthUser } from "@/hooks/useAuthUser"
import { companyProjectsCanCreate } from "@/lib/admin/companyProjectsAcl"

export type CompanyProjectsListLocationState = {
  feedback?: ProjectsTableFeedback
  companyName?: string
}

export function CompanyProjectsListPage() {
  const { companyId: companyIdParam } = useParams<{ companyId: string }>()
  const companyId = companyIdParam ? Number(companyIdParam) : NaN
  const validCompanyId =
    Number.isFinite(companyId) && companyId > 0 ? companyId : null

  const { t: tCompanies } = useTranslation("translation", {
    keyPrefix: "modules.companies",
  })
  const { t: tProjects } = useTranslation("translation", {
    keyPrefix: "modules.projects",
  })
  const { t: tCrumb } = useTranslation("translation", { keyPrefix: "breadcrumb" })
  const location = useLocation()
  const navigate = useNavigate()
  const authUser = useAuthUser()

  const canAccess = useMemo(
    () => companyProjectsCanCreate(authUser?.permissions),
    [authUser],
  )

  const listState = location.state as CompanyProjectsListLocationState | null
  const initialFeedback = listState?.feedback ?? null
  const companyName = listState?.companyName

  useEffect(() => {
    if (!initialFeedback) return
    navigate(location.pathname, { replace: true, state: { companyName } })
  }, [initialFeedback, location.pathname, navigate, companyName])

  useEffect(() => {
    if (validCompanyId == null) {
      navigate("/companies", { replace: true })
    }
  }, [validCompanyId, navigate])

  if (validCompanyId == null) {
    return null
  }

  const projectsTitle = companyName
    ? tProjects("companyProjectsTitle", { company: companyName })
    : tProjects("companyProjectsTitleFallback", { id: validCompanyId })

  return (
    <div className="w-full min-w-0">
      <DashboardModuleBreadcrumbSection
        items={[
          { id: "root", label: tCrumb("root"), to: "/dashboard" },
          { id: "companies", label: tCompanies("title"), to: "/companies" },
          { id: "company-projects", label: projectsTitle },
        ]}
      />
      <div className="space-y-5 px-4 py-6 sm:px-6">
        {canAccess ? (
          <ProjectsTable
            companyId={validCompanyId}
            companyName={companyName}
            initialFeedback={initialFeedback}
          />
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            <AlertTitle>{tProjects("table.accessDeniedTitle")}</AlertTitle>
            <AlertDescription>{tProjects("table.accessDeniedBody")}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
