"use client";

import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";

import { CompaniesTable } from "@/components/table/companies-table";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { companyCanView } from "@/lib/frontend/companies/acl";
import { notify } from "@/lib/frontend/feedback/notify";

export function CompaniesListSection() {
  const { t } = useTranslation("translation", { keyPrefix: "modules.companies" });
  const { data: authUser, isLoading: isAuthLoading } = useAuthUserQuery();
  const accessDeniedNotified = useRef(false);

  const canView = useMemo(() => companyCanView(authUser?.permissions), [authUser]);

  useEffect(() => {
    if (isAuthLoading || canView || accessDeniedNotified.current) return;
    accessDeniedNotified.current = true;
    notify.error(t("table.accessDeniedBody"));
  }, [canView, isAuthLoading, t]);

  return (
    <div className="w-full min-w-0">
      <div className="space-y-5 px-4 py-6 sm:px-6">{canView ? <CompaniesTable /> : null}</div>
    </div>
  );
}
