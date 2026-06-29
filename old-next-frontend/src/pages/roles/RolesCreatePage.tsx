import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { DashboardModuleBreadcrumbSection } from "@/components/layout/DashboardModuleBreadcrumbSection"
import { CreateRoleForm } from "@/components/forms/CreateRoleForm"
import {
  roleRowToFormValues,
  type RolesEditLocationState,
} from "@/lib/admin/createRoleApi"
import { roleCanCreate, roleCanUpdate } from "@/lib/admin/rolesAcl"
import { useAuthUser } from "@/hooks/useAuthUser"

export function RolesCreatePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const authUser = useAuthUser()
  const { t } = useTranslation("translation", { keyPrefix: "modules.roles" })
  const { t: tCrumb } = useTranslation("translation", { keyPrefix: "breadcrumb" })

  const roleId = id ? Number(id) : undefined
  const isEdit = roleId != null && Number.isFinite(roleId) && roleId > 0

  const { canCreate, canUpdate } = useMemo(() => {
    const p = authUser?.permissions ?? []
    return {
      canCreate: roleCanCreate(p),
      canUpdate: roleCanUpdate(p),
    }
  }, [authUser])

  useEffect(() => {
    if (isEdit && !canUpdate) {
      navigate("/roles", { replace: true })
    }
    if (!isEdit && !canCreate) {
      navigate("/roles", { replace: true })
    }
  }, [isEdit, canCreate, canUpdate, navigate])

  const editState = location.state as RolesEditLocationState | null
  const role = editState?.role

  const initialValues = useMemo(
    () => (role ? roleRowToFormValues(role) : undefined),
    [role],
  )

  useEffect(() => {
    if (!isEdit) return
    if (!role || role.id !== roleId) {
      navigate("/roles", { replace: true })
    }
  }, [role, roleId, isEdit, navigate])

  if (isEdit && (!role || role.id !== roleId)) {
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
          { id: "roles", label: t("title"), to: "/roles" },
          {
            id: isEdit ? "edit-role" : "create-role",
            label: isEdit ? t("editRoleTitle") : t("createRoleTitle"),
          },
        ]}
      />
      <div className="w-full px-4 py-6 sm:px-6">
        <CreateRoleForm
          roleId={isEdit ? roleId : undefined}
          initialValues={initialValues}
        />
      </div>
    </div>
  )
}
