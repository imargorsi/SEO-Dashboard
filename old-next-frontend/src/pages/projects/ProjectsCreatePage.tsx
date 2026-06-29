import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { DashboardModuleBreadcrumbSection } from "@/components/layout/DashboardModuleBreadcrumbSection"
import { CreateProjectForm } from "@/components/forms/CreateProjectForm"
import {
  projectRowToFormValues,
  type ProjectsEditLocationState,
} from "@/components/forms/createProjectForm.types"
import { companyProjectsCanCreate } from "@/lib/admin/companyProjectsAcl"
import { projectCanCreate, projectCanUpdate } from "@/lib/admin/projectsAcl"
import { useAuthUser } from "@/hooks/useAuthUser"

export type { ProjectsEditLocationState }

type ProjectsCreatePageParams = {
  id?: string
  companyId?: string
}

export function ProjectsCreatePage() {
  const { id, companyId: companyIdParam } = useParams<ProjectsCreatePageParams>()
  const navigate = useNavigate()
  const location = useLocation()
  const authUser = useAuthUser()
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects" })
  const { t: tCompanies } = useTranslation("translation", {
    keyPrefix: "modules.companies",
  })
  const { t: tCrumb } = useTranslation("translation", { keyPrefix: "breadcrumb" })

  const companyId = companyIdParam ? Number(companyIdParam) : undefined
  const isCompanyScoped =
    companyId != null && Number.isFinite(companyId) && companyId > 0

  const projectId = id ? Number(id) : undefined
  const isEdit = projectId != null && Number.isFinite(projectId) && projectId > 0

  const projectsBasePath = isCompanyScoped
    ? `/companies/${companyId}/projects`
    : "/projects"

  const { canCreate, canUpdate } = useMemo(() => {
    const p = authUser?.permissions ?? []
    if (isCompanyScoped) {
      return {
        canCreate: projectCanCreate(p) || companyProjectsCanCreate(p),
        canUpdate: projectCanUpdate(p) || companyProjectsCanCreate(p),
      }
    }
    return {
      canCreate: projectCanCreate(p),
      canUpdate: projectCanUpdate(p),
    }
  }, [authUser, isCompanyScoped])

  useEffect(() => {
    if (isEdit && !canUpdate) {
      navigate(projectsBasePath, { replace: true })
    }
    if (!isEdit && !canCreate) {
      navigate(projectsBasePath, { replace: true })
    }
  }, [isEdit, canCreate, canUpdate, navigate, projectsBasePath])

  const editState = location.state as ProjectsEditLocationState | null
  const project = editState?.project
  const companyName = editState?.companyName

  const initialValues = useMemo(
    () => (project ? projectRowToFormValues(project) : undefined),
    [project],
  )

  useEffect(() => {
    if (!isEdit) return
    if (!project || project.id !== projectId) {
      navigate(projectsBasePath, { replace: true })
    }
  }, [project, projectId, isEdit, navigate, projectsBasePath])

  if (isEdit && (!project || project.id !== projectId)) {
    return null
  }

  if ((!isEdit && !canCreate) || (isEdit && !canUpdate)) {
    return null
  }

  const breadcrumbItems = [
    { id: "root", label: tCrumb("root"), to: "/dashboard" },
    ...(isCompanyScoped
      ? [
          { id: "companies", label: tCompanies("title"), to: "/companies" },
          {
            id: "company-projects",
            label: companyName
              ? t("companyProjectsTitle", { company: companyName })
              : t("companyProjectsTitleFallback", { id: companyId! }),
            to: projectsBasePath,
          },
        ]
      : [{ id: "projects", label: t("title"), to: "/projects" }]),
    {
      id: isEdit ? "edit-project" : "create-project",
      label: isEdit ? t("editProjectTitle") : t("createProjectTitle"),
    },
  ]

  return (
    <div className="w-full min-w-0">
      <DashboardModuleBreadcrumbSection items={breadcrumbItems} />
      <div className="w-full px-4 py-6 sm:px-6">
        <CreateProjectForm
          projectId={isEdit ? projectId : undefined}
          initialValues={initialValues}
          companyId={isCompanyScoped ? companyId : undefined}
          companyName={companyName}
          backToPath={projectsBasePath}
        />
      </div>
    </div>
  )
}
