"use client";

import { useTranslation } from "react-i18next";

import { SeoActivitiesSheetSyncCard } from "@/components/seo-activities/seo-activities-sheet-sync-card";
import { LoadingState } from "@/components/ui/loading-state";
import { StateCard } from "@/components/ui/state-card";
import { useSeoActivitiesSheetQuery } from "@/features/seo-activities/seo-activities.api";
import { ApiError } from "@/lib/frontend/api/errors";

export function SettingsSeoActivitiesPanel() {
  const { t } = useTranslation("translation", { keyPrefix: "settings.seoActivities" });
  const { data: sheet, isPending, isError, error } = useSeoActivitiesSheetQuery();

  if (isPending) {
    return <LoadingState variant="inline" />;
  }

  if (isError || !sheet) {
    return (
      <StateCard
        title={t("loadErrorTitle")}
        body={ApiError.messageFrom(error, t("loadErrorBody"))}
      />
    );
  }

  return <SeoActivitiesSheetSyncCard sheet={sheet} />;
}
