import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { DashboardModuleBreadcrumbSection } from "@/components/layout/DashboardModuleBreadcrumbSection"
import { CreateCompanyForm } from "@/components/forms/CreateCompanyForm"
import {
  companyRowToFormValues,
  type CompaniesEditLocationState,
} from "@/lib/admin/companyFormMapper"
import { companyCanCreate, companyCanUpdate } from "@/lib/admin/companiesAcl"
import { useAuthUser } from "@/hooks/useAuthUser"

export function CompaniesCreatePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const authUser = useAuthUser()
  const { t } = useTranslation("translation", { keyPrefix: "modules.companies" })
  const { t: tCrumb } = useTranslation("translation", { keyPrefix: "breadcrumb" })

  const companyId = id ? Number(id) : undefined
  const isEdit = companyId != null && Number.isFinite(companyId) && companyId > 0

  const { canCreate, canUpdate } = useMemo(() => {
    const p = authUser?.permissions ?? []
    return {
      canCreate: companyCanCreate(p),
      canUpdate: companyCanUpdate(p),
    }
  }, [authUser])

  useEffect(() => {
    if (isEdit && !canUpdate) {
      navigate("/companies", { replace: true })
    }
    if (!isEdit && !canCreate) {
      navigate("/companies", { replace: true })
    }
  }, [isEdit, canCreate, canUpdate, navigate])

  const editState = location.state as CompaniesEditLocationState | null
  const company = editState?.company

  const initialValues = useMemo(
    () => (company ? companyRowToFormValues(company) : undefined),
    [company],
  )

  useEffect(() => {
    if (!isEdit) return
    if (!company || company.id !== companyId) {
      navigate("/companies", { replace: true })
    }
  }, [company, companyId, isEdit, navigate])

  if (isEdit && (!company || company.id !== companyId)) {
    return null
  }

  if ((!isEdit && !canCreate) || (isEdit && !canUpdate)) {
    return null
  }

  return (
    <div className="w-full min-w-0">
      <DashboardModuleBreadcrumbSection
        items={[
          { id: "root", label: tCrumb("root"), to: "/dashboard" },
          { id: "companies", label: t("title"), to: "/companies" },
          {
            id: isEdit ? "edit-company" : "create-company",
            label: isEdit ? t("editCompanyTitle") : t("createCompanyTitle"),
          },
        ]}
      />
      <div className="w-full px-4 py-6 sm:px-6">
        <CreateCompanyForm companyId={isEdit ? companyId : undefined} initialValues={initialValues} />
      </div>
    </div>
  )
}
