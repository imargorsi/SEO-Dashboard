import { useTranslation } from "react-i18next"
import { DashboardModuleBreadcrumbSection } from "@/components/layout/DashboardModuleBreadcrumbSection"

export function UsersCreatePage() {
  const { t } = useTranslation("translation", { keyPrefix: "modules.users" })
  const { t: tCrumb } = useTranslation("translation", { keyPrefix: "breadcrumb" })

  return (
    <div className="w-full min-w-0">
      <DashboardModuleBreadcrumbSection
        items={[
          { id: "root", label: tCrumb("root"), to: "/dashboard" },
          { id: "users", label: t("title"), to: "/users" },
          { id: "create-user", label: t("createUserTitle") },
        ]}
      />
      <div className="px-4 py-6 sm:px-6">
        <p className="text-[var(--text)]">{t("createComingSoon")}</p>
      </div>
    </div>
  )
}
