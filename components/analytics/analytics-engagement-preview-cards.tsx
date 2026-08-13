"use client";

import type { TAppIconComponent } from "@/components/ui/app-icon";
import { Icons } from "@/lib/frontend/icons/app-icons";

import { useTranslation } from "react-i18next";

import { AnalyticsTrendSparkline } from "@/components/analytics/analytics-trend-sparkline";
import {
  elevatedCardSurfaceClass,
  metricIconWellClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion.hook";
import { cn } from "@/lib/utils";
import type { TAnalyticsCardMetricDto, TAnalyticsOverviewDto } from "@/types/analytics.types";

type TMetricCardId = "engagementRate" | "avgSessionDuration" | "pageViews";

type TMetricCardDef = {
  id: TMetricCardId;
  icon: TAppIconComponent;
  accent: string;
  valueLabel: string;
  sparkline: number[];
};

type TAnalyticsEngagementPreviewCardsProps = {
  overview: TAnalyticsOverviewDto | undefined;
  isLoading?: boolean;
  className?: string;
};

function formatRatioPercent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

function formatSessionDuration(totalSeconds: number | null | undefined): string {
  if (totalSeconds == null || Number.isNaN(totalSeconds)) return "—";
  const rounded = Math.round(totalSeconds);
  const minutes = Math.floor(rounded / 60);
  const seconds = rounded % 60;
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

function formatCompactNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat(undefined, {
    notation: value >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: value >= 10_000 ? 1 : 0,
  }).format(value);
}

function emptyMetric(): TAnalyticsCardMetricDto {
  return { value: null, sparkline: [] };
}

function CardSkeleton() {
  return (
    <div className={cn(elevatedCardSurfaceClass, "min-h-36 rounded-2xl px-4 pb-4 pt-4 sm:px-5")}>
      <div className="flex flex-col gap-3">
        <div className="size-10 animate-pulse rounded-xl bg-bg-hover/70" />
        <div className="h-3 w-24 animate-pulse rounded bg-bg-hover/70" />
        <div className="h-8 w-16 animate-pulse rounded-lg bg-bg-hover/80" />
      </div>
    </div>
  );
}

export function AnalyticsEngagementPreviewCards({
  overview,
  isLoading,
  className,
}: TAnalyticsEngagementPreviewCardsProps) {
  const { t } = useTranslation("translation", {
    keyPrefix: "modules.analytics.engagementPreview",
  });
  const reduceMotion = usePrefersReducedMotion();

  const engagement = overview?.engagement;
  const engagementRate = engagement?.engagementRate ?? emptyMetric();
  const avgSessionDuration = engagement?.avgSessionDuration ?? emptyMetric();
  const pageViews = engagement?.pageViews ?? emptyMetric();

  const metricCards: TMetricCardDef[] = [
    {
      id: "engagementRate",
      icon: Icons.chartLine,
      accent: "var(--status-active)",
      valueLabel: formatRatioPercent(engagementRate.value),
      sparkline: engagementRate.sparkline,
    },
    {
      id: "avgSessionDuration",
      icon: Icons.clock,
      accent: "var(--brand)",
      valueLabel: formatSessionDuration(avgSessionDuration.value),
      sparkline: avgSessionDuration.sparkline,
    },
    {
      id: "pageViews",
      icon: Icons.view,
      accent: "var(--status-pending)",
      valueLabel: formatCompactNumber(pageViews.value),
      sparkline: pageViews.sparkline,
    },
  ];

  if (isLoading && !overview) {
    return (
      <div className={cn("flex min-w-0 flex-col gap-3", className)}>
        {metricCards.map((card) => (
          <CardSkeleton key={card.id} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      {metricCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={cn(
              elevatedCardSurfaceClass,
              "flex w-full flex-col overflow-hidden rounded-2xl pt-4",
            )}
          >
            <div className="flex flex-col gap-3 px-4 sm:px-5">
              <span className={metricIconWellClass} style={{ color: card.accent }}>
                <Icon className="size-5" aria-hidden />
              </span>
              <div className="flex flex-col gap-1">
                <p className="type-overline text-text-muted">{t(`${card.id}.label`)}</p>
                <p className="type-h1 font-semibold tracking-tight text-text-primary">
                  {card.valueLabel}
                </p>
                <p className="type-caption text-text-muted">{t(`${card.id}.hint`)}</p>
              </div>
            </div>
            <div className="mt-3 h-10 w-full shrink-0 px-2 pb-1">
              {card.sparkline.length > 0 ? (
                <AnalyticsTrendSparkline
                  id={card.id}
                  accent={card.accent}
                  values={card.sparkline}
                  reduceMotion={reduceMotion}
                  height={48}
                />
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
