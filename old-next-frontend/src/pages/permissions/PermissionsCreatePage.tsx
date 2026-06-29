import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { DashboardModuleBreadcrumbSection } from "@/components/layout/DashboardModuleBreadcrumbSection"
import { CreatePermissionForm } from "@/components/forms/CreatePermissionForm"
import {
  permissionRowToFormValues,
  type PermissionsEditLocationState,
} from "@/lib/admin/createPermissionApi"

export function PermissionsCreatePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation("translation", {
    keyPrefix: "modules.permissions",
  })
  const { t: tCrumb } = useTranslation("translation", { keyPrefix: "breadcrumb" })

  const permissionId = id ? Number(id) : undefined
  const isEdit =
    permissionId != null && Number.isFinite(permissionId) && permissionId > 0

  const editState = location.state as PermissionsEditLocationState | null
  const permission = editState?.permission

  const initialValues = useMemo(
    () => (permission ? permissionRowToFormValues(permission) : undefined),
    [permission],
  )

  useEffect(() => {
    if (!isEdit) return
    if (!permission || permission.id !== permissionId) {
      navigate("/permissions", { replace: true })
    }
  }, [permission, permissionId, isEdit, navigate])

  if (isEdit && (!permission || permission.id !== permissionId)) {
    return null
  }

  return (
    <div className="w-full min-w-0">
      <DashboardModuleBreadcrumbSection
        items={[
          { id: "root", label: tCrumb("root"), to: "/dashboard" },
          { id: "permissions", label: t("title"), to: "/permissions" },
          {
            id: isEdit ? "edit-permission" : "create-permission",
            label: isEdit ? t("editPermissionTitle") : t("createPermissionTitle"),
          },
        ]}
      />
      <div className="w-full px-4 py-6 sm:px-6">
        <CreatePermissionForm
          permissionId={isEdit ? permissionId : undefined}
          initialValues={initialValues}
        />
      </div>
    </div>
  )
}
