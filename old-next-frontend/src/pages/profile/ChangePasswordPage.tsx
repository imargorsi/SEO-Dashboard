import { useTranslation } from "react-i18next"
import { DashboardModuleBreadcrumbSection } from "@/components/layout/DashboardModuleBreadcrumbSection"
import { ChangePasswordForm } from "@/components/forms/ChangePasswordForm"

export function ChangePasswordPage() {
  const { t } = useTranslation("translation", {
    keyPrefix: "profile.changePassword",
  })
  const { t: tCrumb } = useTranslation("translation", { keyPrefix: "breadcrumb" })

  return (
    <div className="w-full min-w-0">
      <DashboardModuleBreadcrumbSection
        items={[
          { id: "root", label: tCrumb("root"), to: "/dashboard" },
          { id: "change-password", label: t("title") },
        ]}
      />
      <div className="w-full px-4 py-6 sm:px-6">
        <ChangePasswordForm />
      </div>
    </div>
  )
}
