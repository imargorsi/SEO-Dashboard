import { useTranslation } from "react-i18next"
import { DashboardModuleBreadcrumbSection } from "@/components/layout/DashboardModuleBreadcrumbSection"

export function SettingsPage() {
  const { t } = useTranslation("translation", { keyPrefix: "settings" })
  const { t: tCrumb } = useTranslation("translation", { keyPrefix: "breadcrumb" })

  return (
    <div className="w-full min-w-0">
      <DashboardModuleBreadcrumbSection
        items={[
          { id: "root", label: tCrumb("root"), to: "/dashboard" },
          { id: "settings", label: t("title") },
        ]}
      />
      <div className="px-4 py-6 sm:px-6">
        <h2 className="text-[var(--text-h)]">{t("title")}</h2>
        <p className="mt-2 text-[var(--text)]">{t("subtitle")}</p>
      </div>
    </div>
  )
}
