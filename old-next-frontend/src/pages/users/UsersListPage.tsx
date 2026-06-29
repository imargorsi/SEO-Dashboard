import { useTranslation } from "react-i18next"
import { DashboardModuleBreadcrumbSection } from "@/components/layout/DashboardModuleBreadcrumbSection"

export function UsersListPage() {
  const { t } = useTranslation("translation", { keyPrefix: "modules.users" })
  const { t: tCrumb } = useTranslation("translation", { keyPrefix: "breadcrumb" })

  return (
    <div className="w-full min-w-0">
      <DashboardModuleBreadcrumbSection
        items={[
          { id: "root", label: tCrumb("root"), to: "/dashboard" },
          { id: "users", label: t("title") },
        ]}
      />
      <div className="px-4 py-6 sm:px-6">
        <h1 className="mb-2 text-3xl font-semibold text-[var(--text-h)]">
          {t("title")}
        </h1>
        <p className="text-[var(--text)]">{t("subtitle")}</p>
      </div>
    </div>
  )
}
