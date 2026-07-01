"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { IoAlertCircle } from "react-icons/io5";

import { DashboardModuleBreadcrumbSection } from "@/components/layout/dashboard-module-breadcrumb-section";
import { CompaniesTable } from "@/components/table/companies-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { companyCanView } from "@/lib/frontend/companies/acl";

export function CompaniesListSection() {
  const { t } = useTranslation("translation", { keyPrefix: "modules.companies" });
  const { t: tCrumb } = useTranslation("translation", { keyPrefix: "breadcrumb" });
  const { data: authUser } = useAuthUserQuery();

  const canView = useMemo(() => companyCanView(authUser?.permissions), [authUser]);

  return (
    <div className="w-full min-w-0">
      <DashboardModuleBreadcrumbSection
        items={[
          { id: "root", label: tCrumb("root"), href: "/dashboard" },
          { id: "companies", label: t("title") },
        ]}
      />
      <div className="space-y-5 px-4 py-6 sm:px-6">
        {canView ? (
          <CompaniesTable />
        ) : (
          <Alert variant="destructive">
            <IoAlertCircle className="size-4 shrink-0" aria-hidden />
            <AlertTitle>{t("table.accessDeniedTitle")}</AlertTitle>
            <AlertDescription>{t("table.accessDeniedBody")}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
