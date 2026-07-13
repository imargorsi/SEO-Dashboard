"use client";

import { useTranslation } from "react-i18next";

import { LoadingState } from "@/components/ui/loading-state";

export function ProjectDetailPageFallback() {
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects.detail" });
  return <LoadingState label={t("loading")} />;
}
