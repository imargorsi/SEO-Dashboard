"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AnalyticsGscRankingsModal } from "@/components/analytics/analytics-gsc-rankings-modal";
import { AnalyticsGscRankingsTable } from "@/components/analytics/analytics-gsc-rankings-table";
import {
  analyticsPanelClass,
  elevatedCardSurfaceClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";
import type { TAnalyticsDimensionRowDto } from "@/types/analytics.types";

type TAnalyticsGscRankingsCardProps = {
  rows: TAnalyticsDimensionRowDto[];
  isLoading?: boolean;
  /** i18n key under `modules.analytics.*` (e.g. `topQueries`, `topPages`). */
  i18nKey: "topQueries" | "topPages";
  titleId: string;
  /** Preview row cap. */
  limit?: number;
  className?: string;
  showViewAll?: boolean;
  projectId?: string | null;
  from?: string;
  to?: string;
};

export function AnalyticsGscRankingsCard({
  rows,
  isLoading,
  i18nKey,
  titleId,
  limit = 9,
  className,
  showViewAll = false,
  projectId,
  from = "",
  to = "",
}: TAnalyticsGscRankingsCardProps) {
  const { t } = useTranslation("translation", {
    keyPrefix: `modules.analytics.${i18nKey}`,
  });
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const previewRows = rows.slice(0, limit);
  const canOpenViewAll =
    showViewAll && Boolean(projectId) && Boolean(from && to) && !isLoading && rows.length > 0;

  return (
    <>
      <section
        className={cn(elevatedCardSurfaceClass, analyticsPanelClass, className)}
        aria-labelledby={titleId}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 id={titleId} className="type-title text-text-primary">
            {t("title")}
          </h2>
          {showViewAll ? (
            <button
              type="button"
              disabled={!canOpenViewAll}
              onClick={() => setViewAllOpen(true)}
              className={cn(
                "type-caption font-medium text-brand transition-opacity",
                canOpenViewAll
                  ? "hover:opacity-80"
                  : "cursor-not-allowed opacity-40",
              )}
            >
              {t("viewAll")}
            </button>
          ) : null}
        </div>

        <AnalyticsGscRankingsTable
          rows={previewRows}
          i18nKey={i18nKey}
          isLoading={isLoading}
        />
      </section>

      {showViewAll ? (
        <AnalyticsGscRankingsModal
          open={viewAllOpen}
          onOpenChange={setViewAllOpen}
          i18nKey={i18nKey}
          projectId={projectId}
          from={from}
          to={to}
        />
      ) : null}
    </>
  );
}
