import { useTranslation } from "react-i18next"
import { DashboardModuleBreadcrumbSection } from "@/components/layout/DashboardModuleBreadcrumbSection"
import { EditProfileForm } from "@/components/forms/EditProfileForm"

export function EditProfilePage() {
  const { t } = useTranslation("translation", { keyPrefix: "profile.edit" })
  const { t: tCrumb } = useTranslation("translation", { keyPrefix: "breadcrumb" })

  return (
    <div className="w-full min-w-0">
      <DashboardModuleBreadcrumbSection
        items={[
          { id: "root", label: tCrumb("root"), to: "/dashboard" },
          { id: "edit-profile", label: t("breadcrumbTitle") },
        ]}
      />
      <div className="w-full px-4 py-6 sm:px-6">
        <EditProfileForm />
      </div>
    </div>
  )
}
