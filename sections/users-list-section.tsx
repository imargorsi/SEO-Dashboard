"use client";

import { useTranslation } from "react-i18next";

import { DashboardModuleBreadcrumbSection } from "@/components/layout/dashboard-module-breadcrumb-section";
import { UsersTable } from "@/components/table/users-table";

export function UsersListSection() {
  const { t } = useTranslation("translation", { keyPrefix: "modules.users" });
  const { t: tCrumb } = useTranslation("translation", { keyPrefix: "breadcrumb" });

  return (
    <div className="w-full min-w-0">
      <DashboardModuleBreadcrumbSection
        items={[
          { id: "root", label: tCrumb("root"), href: "/dashboard" },
          { id: "users", label: t("title") },
        ]}
      />
      <div className="space-y-5 px-4 py-6 sm:px-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-[var(--text-h)]">{t("title")}</h1>
          <p className="text-sm text-[var(--text-muted)]">{t("subtitle")}</p>
        </div>
        <UsersTable />
      </div>
    </div>
  );
}
