"use client";

import { useTranslation } from "react-i18next";

export function DashboardHomeSection() {
  const { t } = useTranslation("translation", { keyPrefix: "home" });

  return (
    <div className="w-full min-w-0">
      <div className="px-4 py-6 sm:px-6">
        <h1 className="mb-2 text-3xl font-semibold text-[var(--text-h)]">{t("title")}</h1>
        <p className="text-[var(--text)]">{t("subtitle")}</p>
      </div>
    </div>
  );
}
