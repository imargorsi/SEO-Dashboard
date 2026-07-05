"use client";

import { useTranslation } from "react-i18next";

import { UsersTable } from "@/components/table/users-table";

export function UsersListSection() {
  const { t } = useTranslation("translation", { keyPrefix: "modules.users" });

  return (
    <div className="w-full min-w-0">
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
