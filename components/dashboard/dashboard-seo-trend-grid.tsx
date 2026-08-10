"use client";

import type { IconType } from "react-icons";
import {
  MdOutlineAdsClick,
  MdOutlineLeaderboard,
  MdOutlinePercent,
  MdOutlineVisibility,
} from "react-icons/md";
import { useTranslation } from "react-i18next";

import { AnalyticsTrendSparkline } from "@/components/analytics/analytics-trend-sparkline";
import { EmptyState } from "@/components/ui/empty-state";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion.hook";
import {
  elevatedCardSurfaceClass,
  typeStackMdClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";
import type { TAnalyticsCardMetricDto, TAnalyticsOverviewDto } from "@/types/analytics.types";

type TTrendCardId = "clicks" | "impressions" | "ctr" | "position";

type TTrendCardDef = {
  id: TTrendCardId;
  icon: IconType;
  accent: string;
  format: (value: number | null | undefined) => string;
  metric: TAnalyticsCardMetricDto | undefined;
};

type TDashboardSeoTrendGridProps = {
  overview: TAnalyticsOverviewDto | undefined;
  isLoading?: boolean;
  className?: string;
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
    <div
      className={cn(
        elevatedCardSurfaceClass,
        "flex h-full min-h-0 flex-col justify-between rounded-2xl p-3 sm:p-3.5",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-2">
          <div className="h-3 w-16 animate-pulse rounded bg-bg-hover/70" />
          <div className="h-7 w-14 animate-pulse rounded-lg bg-bg-hover/80" />
        </div>
        <div className="size-9 animate-pulse rounded-xl bg-bg-hover/70" />
      </div>
      <div className="mt-3 h-14 w-full animate-pulse rounded-xl bg-bg-hover/50" />
    </div>
  );
}

export function DashboardSeoTrendGrid({
  overview,
  isLoading,
  className,
}: TDashboardSeoTrendGridProps) {
  const { t } = useTranslation("translation", { keyPrefix: "home.trend" });
  const { t: tTabs } = useTranslation("translation", {
    keyPrefix: "modules.analytics.trendChart.tabs",
  });
  const reduceMotion = usePrefersReducedMotion();
  const cardsData = overview?.cards;

  const cards: TTrendCardDef[] = [
    {
      id: "clicks",
      icon: MdOutlineAdsClick,
      accent: "var(--color-brand-primary)",
      format: formatCompactNumber,
      metric: cardsData?.clicks,
    },
    {
      id: "impressions",
      icon: MdOutlineVisibility,
      accent: "var(--status-pending)",
      format: formatCompactNumber,
      metric: cardsData?.impressions,
    },
    {
      id: "ctr",
      icon: MdOutlinePercent,
      accent: "var(--status-active)",
      format: formatPercentRatio,
      metric: cardsData?.ctr,
    },
    {
      id: "position",
      icon: MdOutlineLeaderboard,
      accent: "var(--color-brand-primary)",
      format: formatPosition,
      metric: cardsData?.position,
    },
  ];

  const gridClass = cn(
    "grid h-full min-h-0 grid-cols-2 gap-2.5 sm:gap-3",
    className,
  );

  if (isLoading && !overview) {
    return (
      <div className={gridClass}>
        {cards.map((card) => (
          <CardSkeleton key={card.id} />
        ))}
      </div>
    );
  }

  const hasAnySignal = cards.some((card) => (card.metric?.sparkline?.length ?? 0) > 0);

  if (!hasAnySignal) {
    return (
      <div
        className={cn(
          elevatedCardSurfaceClass,
          "flex h-full min-h-0 items-center justify-center rounded-2xl p-4",
          className,
        )}
      >
        <EmptyState title={t("emptyTitle")} description={t("emptyBody")} />
      </div>
    );
  }

  return (
    <div className={gridClass} role="list" aria-label={t("gridAria")}>
      {cards.map((card) => {
        const Icon = card.icon;
        const sparkline = card.metric?.sparkline ?? [];

        return (
          <article
            key={card.id}
            role="listitem"
            className={cn(
              elevatedCardSurfaceClass,
              "relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl",
              "bg-bg-card/20 p-3 dark:bg-text-primary/5 sm:p-3.5",
            )}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, ${card.accent} 14%, transparent), transparent 58%)`,
              }}
              aria-hidden
            />

            <div className="relative z-10 flex items-start justify-between gap-2">
              <div className={cn(typeStackMdClass, "min-w-0")}>
                <p className="type-caption font-medium text-text-secondary">
                  {tTabs(card.id)}
                </p>
                <p className="type-h2 font-semibold tracking-tight text-text-primary tabular-nums leading-none">
                  {card.format(card.metric?.value)}
                </p>
              </div>
              <span
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border backdrop-blur-md"
                style={{
                  color: card.accent,
                  borderColor: `color-mix(in srgb, ${card.accent} 42%, transparent)`,
                  background: `color-mix(in srgb, ${card.accent} 14%, transparent)`,
                }}
                aria-hidden
              >
                <Icon className="size-5" />
              </span>
            </div>

            <div className="relative z-10 mt-auto h-16 w-full min-h-0 pt-2 sm:h-18">
              {sparkline.length > 0 ? (
                <AnalyticsTrendSparkline
                  id={`dashboard-trend-${card.id}`}
                  accent={card.accent}
                  values={sparkline}
                  reduceMotion={reduceMotion}
                  height={56}
                />
              ) : (
                <div className="flex h-full items-end">
                  <p className="type-caption text-text-muted">{t("noSeries")}</p>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
