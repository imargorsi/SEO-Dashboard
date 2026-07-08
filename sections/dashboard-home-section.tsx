"use client";

import { useTranslation } from "react-i18next";
import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";

export function DashboardHomeSection() {
  const { t } = useTranslation("translation", { keyPrefix: "home" });

  return (
    <div className="w-full min-w-0">
      <div className="px-4 py-6 sm:px-6">
        <Heading id="dashboard-home-title" pageTitle className="mb-2">
          {t("title")}
        </Heading>
        <Paragraph className="text-text-secondary">{t("subtitle")}</Paragraph>
      </div>
    </div>
  );
}
