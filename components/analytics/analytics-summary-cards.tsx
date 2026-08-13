"use client";

import type { TAppIconComponent } from "@/components/ui/app-icon";
import { Icons } from "@/lib/frontend/icons/app-icons";

import { useTranslation } from "react-i18next";

import { AnalyticsTrendSparkline } from "@/components/analytics/analytics-trend-sparkline";
import { elevatedCardSurfaceClass, metricIconWellClass } from "@/lib/frontend/layout/dashboard-chrome";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion.hook";
import { cn } from "@/lib/utils";
import type { TAnalyticsCardMetricDto, TAnalyticsOverviewDto } from "@/types/analytics.types";

type TAnalyticsSummaryCardsProps = {
  overview: TAnalyticsOverviewDto | undefined;
  isLoading?: boolean;
  className?: string;
};

type TCardId = "clicks" | "impressions" | "ctr" | "position";

type TCardDef = {
  id: TCardId;
  labelKey: TCardId;
  icon: TAppIconComponent;
  accent: string;
  format: (value: number | null | undefined) => string;
  metric: TAnalyticsCardMetricDto | undefined;
};

function formatCompactNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat(undefined, {
    notation: value >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: value >= 10_000 ? 1 : 0,
  }).format(value);
}

function formatPercentRatio(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

function formatPosition(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toFixed(1);
}

function CardSkeleton() {
  return (
    <div className={cn(elevatedCardSurfaceClass, "min-h-48 rounded-2xl px-4 pb-5 pt-4 sm:px-5 sm:pt-5")}>
      <div className="flex flex-col gap-3">
        <div className="size-10 animate-pulse rounded-xl bg-bg-hover/70" />
        <div className="h-3 w-24 animate-pulse rounded bg-bg-hover/70" />
        <div className="h-9 w-20 animate-pulse rounded-lg bg-bg-hover/80" />
      </div>
    </div>
  );
}

export function AnalyticsSummaryCards({
  overview,
  isLoading,
  className,
}: TAnalyticsSummaryCardsProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.analytics.summary" });
  const reduceMotion = usePrefersReducedMotion();
  const cardsData = overview?.cards;

  const cards: TCardDef[] = [
    {
      id: "clicks",
      labelKey: "clicks",
      icon: Icons.chartBar,
      accent: "var(--brand)",
      format: formatCompactNumber,
      metric: cardsData?.clicks,
    },
    {
      id: "impressions",
      labelKey: "impressions",
      icon: Icons.view,
      accent: "var(--status-pending)",
      format: formatCompactNumber,
      metric: cardsData?.impressions,
    },
    {
      id: "ctr",
      labelKey: "ctr",
      icon: Icons.chartLine,
      accent: "var(--status-active)",
      format: formatPercentRatio,
      metric: cardsData?.ctr,
    },
    {
      id: "position",
      labelKey: "position",
      icon: Icons.analytics,
      accent: "var(--color-brand-primary)",
      format: formatPosition,
      metric: cardsData?.position,
    },
  ];

  if (isLoading && !overview) {
    return (
      <div className={cn("grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4", className)}>
        {cards.map((card) => (
          <CardSkeleton key={card.id} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4", className)}>
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.id}
            className={cn(
              elevatedCardSurfaceClass,
              "flex min-h-48 flex-col overflow-hidden rounded-2xl pt-4 sm:pt-5",
            )}
          >
            <div className="flex flex-col gap-4 px-4 sm:px-5">
              <span className={metricIconWellClass} style={{ color: card.accent }}>
                <Icon className="size-5" aria-hidden />
              </span>

              <div className="flex flex-col gap-4">
                <p className="type-overline text-text-muted">{t(card.labelKey)}</p>
                <p className="type-h1 font-semibold tracking-tight text-text-primary">
                  {card.format(card.metric?.value)}
                </p>
              </div>
            </div>

            <div className="mt-auto h-12 w-full shrink-0 px-2 pb-1 pt-0">
              <AnalyticsTrendSparkline
                id={card.id}
                accent={card.accent}
                values={card.metric?.sparkline ?? []}
                reduceMotion={reduceMotion}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
