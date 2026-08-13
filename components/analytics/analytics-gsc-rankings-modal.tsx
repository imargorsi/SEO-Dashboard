"use client";

import { Icons } from "@/lib/frontend/icons/app-icons";

import { useEffect, useId, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import { AnalyticsGscRankingsTable } from "@/components/analytics/analytics-gsc-rankings-table";
import { Button } from "@/components/ui/button";
import { DialogSectionDivider } from "@/components/ui/dialog-section-divider";
import { useAnalyticsDimensionsQuery } from "@/features/analytics/analytics.api";
import { dialogSurfaceClass } from "@/lib/frontend/layout/dashboard-chrome";
import { overlayClass } from "@/lib/frontend/theme/chrome-tones";
import { cn } from "@/lib/utils";

const VIEW_ALL_LIMIT = 100;

type TAnalyticsGscRankingsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  i18nKey: "topQueries" | "topPages";
  projectId: string | null | undefined;
  from: string;
  to: string;
};

export function AnalyticsGscRankingsModal({
  open,
  onOpenChange,
  i18nKey,
  projectId,
  from,
  to,
}: TAnalyticsGscRankingsModalProps) {
  const { t } = useTranslation("translation", {
    keyPrefix: `modules.analytics.${i18nKey}`,
  });
  const titleId = useId();
  const descriptionId = useId();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const dimensionType = i18nKey === "topQueries" ? "query" : "page";
  const enabled = open && Boolean(projectId) && Boolean(from && to);

  const query = useAnalyticsDimensionsQuery(
    projectId,
    {
      from,
      to,
      source: "gsc",
      dimensionType,
      limit: VIEW_ALL_LIMIT,
    },
    { enabled },
  );

  const rows = query.data?.rows ?? [];

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onOpenChange(false);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label={t("modalClose")}
        className={cn("absolute inset-0 backdrop-blur-[2px]", overlayClass)}
        onClick={() => onOpenChange(false)}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn(
          "relative z-10 flex max-h-[min(92vh,44rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl",
          dialogSurfaceClass,
        )}
      >
        <header className="relative type-stack-md shrink-0 px-5 pb-4 pt-5 pe-14 sm:px-6">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute inset-e-3 top-3 rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary"
          >
            <Icons.cancel className="size-4" aria-hidden />
            <span className="sr-only">{t("modalClose")}</span>
          </button>

          <h2 id={titleId} className="type-title text-text-primary">
            {t("modalTitle")}
          </h2>
          <p id={descriptionId} className="type-caption text-text-muted">
            {t("modalSubtitle")}
          </p>
        </header>
        <DialogSectionDivider />

        <div className="themed-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          <AnalyticsGscRankingsTable
            rows={rows}
            i18nKey={i18nKey}
            isLoading={query.isLoading || query.isFetching}
            showRank
            stickyHeader
          />
        </div>

        <DialogSectionDivider />
        <footer className="flex shrink-0 items-center justify-between gap-3 px-5 py-3.5 sm:px-6">
          <p className="type-caption text-text-muted">
            {query.isLoading || query.isFetching
              ? t("loading")
              : t("modalRowCount", { count: rows.length })}
          </p>
          <Button type="button" variant="outlined" size="md" onClick={() => onOpenChange(false)}>
            {t("modalClose")}
          </Button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
