"use client";

import type { CSSProperties } from "react";
import { useEffect, useId, useMemo, useState } from "react";
import type { IconType } from "react-icons";
import {
  IoEyeOutline,
  IoHandLeftOutline,
  IoSearchOutline,
  IoStatsChartOutline,
  IoTrendingDown,
  IoTrendingUp,
} from "react-icons/io5";
import { useTranslation } from "react-i18next";

import { buildSparklinePathsFromValues } from "@/lib/frontend/analytics/sparkline.utils";
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
  icon: IconType;
  /** Theme CSS color token for accent. */
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

function formatChangePercent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return reduced;
}

function DotGrid({ accent }: { accent: string }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.22]"
      style={{
        backgroundImage: `radial-gradient(circle, color-mix(in srgb, ${accent} 55%, transparent) 1px, transparent 1.25px)`,
        backgroundSize: "14px 14px",
        backgroundPosition: "right top",
        maskImage: "radial-gradient(90% 70% at 100% 0%, black 20%, transparent 75%)",
        WebkitMaskImage: "radial-gradient(90% 70% at 100% 0%, black 20%, transparent 75%)",
      }}
      aria-hidden
    />
  );
}

function TrendSparkline({
  id,
  accent,
  values,
  isUp,
  isDown,
  reduceMotion,
}: {
  id: string;
  accent: string;
  values: number[];
  isUp: boolean;
  isDown: boolean;
  reduceMotion: boolean;
}) {
  const reactId = useId().replace(/:/g, "");
  const gradId = `${id}-${reactId}-fill`;
  const strokeId = `${id}-${reactId}-stroke`;
  const width = 280;
  const height = 64;

  const preferRising = isUp ? true : isDown ? false : null;
  const paths = useMemo(
    () => buildSparklinePathsFromValues(values, width, height, { preferRising }),
    [values, preferRising],
  );

  if (!paths) return null;

  return (
    <svg
      className={cn("h-full w-full", !reduceMotion && "seo-sparkline-wave")}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: accent, stopOpacity: 0.35 }} />
          <stop offset="100%" style={{ stopColor: accent, stopOpacity: 0 }} />
        </linearGradient>
        <linearGradient id={strokeId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: accent, stopOpacity: 0.35 }} />
          <stop offset="55%" style={{ stopColor: accent, stopOpacity: 0.95 }} />
          <stop offset="100%" style={{ stopColor: accent, stopOpacity: 1 }} />
        </linearGradient>
        <filter id={`${id}-${reactId}-glow`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path
        d={paths.area}
        fill={`url(#${gradId})`}
        className={cn(!reduceMotion && "seo-sparkline-area-live")}
      />
      <path
        d={paths.line}
        fill="none"
        stroke={`url(#${strokeId})`}
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${id}-${reactId}-glow)`}
      />
      {/* Trend pointer */}
      <circle
        cx={paths.end.x}
        cy={paths.end.y}
        r="5.5"
        fill={accent}
        opacity="0.28"
      />
      <circle
        cx={paths.end.x}
        cy={paths.end.y}
        r="3.25"
        fill={accent}
        stroke="color-mix(in srgb, var(--text-on-brand) 70%, transparent)"
        strokeWidth="1.25"
      />
    </svg>
  );
}

function CardSkeleton({ accent }: { accent: string }) {
  return (
    <div
      className={cn(
        "relative isolate min-h-44 overflow-hidden rounded-3xl border border-border/40",
        "bg-bg-card/30 backdrop-blur-2xl",
        "px-4 pb-5 pt-4 sm:px-5",
      )}
      style={
        {
          boxShadow: `0 16px 40px color-mix(in srgb, ${accent} 10%, transparent)`,
        } as CSSProperties
      }
    >
      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="size-10 animate-pulse rounded-xl bg-bg-hover/70" />
          <div className="h-7 w-16 animate-pulse rounded-full bg-bg-hover/70" />
        </div>
        <div className="h-3 w-24 animate-pulse rounded bg-bg-hover/70" />
        <div className="h-9 w-20 animate-pulse rounded-lg bg-bg-hover/80" />
        <div className="h-6 w-28 animate-pulse rounded-full bg-bg-hover/60" />
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
      icon: IoHandLeftOutline,
      accent: "var(--color-brand-primary)",
      format: formatCompactNumber,
      metric: cardsData?.clicks,
    },
    {
      id: "impressions",
      labelKey: "impressions",
      icon: IoEyeOutline,
      accent: "var(--status-invited)",
      format: formatCompactNumber,
      metric: cardsData?.impressions,
    },
    {
      id: "ctr",
      labelKey: "ctr",
      icon: IoStatsChartOutline,
      accent: "var(--status-active)",
      format: formatPercentRatio,
      metric: cardsData?.ctr,
    },
    {
      id: "position",
      labelKey: "position",
      icon: IoSearchOutline,
      accent: "var(--color-secondary)",
      format: formatPosition,
      metric: cardsData?.position,
    },
  ];

  if (isLoading && !overview) {
    return (
      <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>
        {cards.map((card) => (
          <CardSkeleton key={card.id} accent={card.accent} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {cards.map((card) => {
        const Icon = card.icon;
        const change = card.metric?.changePercent ?? null;
        const isUp = change != null && change > 0;
        const isDown = change != null && change < 0;
        const previousValue = card.format(card.metric?.previousValue);
        const isPositionWorse =
          card.id === "position" && change != null && change < 0;

        const cardStyle = {
          boxShadow: `
            inset 1px 1px 0 color-mix(in srgb, var(--text-on-brand) 16%, transparent),
            inset -1px -1px 0 color-mix(in srgb, ${card.accent} 8%, transparent),
            0 0 0 1px color-mix(in srgb, ${card.accent} 14%, transparent),
            0 18px 42px color-mix(in srgb, ${card.accent} 12%, transparent)
          `,
        } as CSSProperties;

        return (
          <div
            key={card.id}
            className={cn(
              "group relative isolate flex min-h-44 flex-col overflow-hidden rounded-3xl",
              "border border-white/10 dark:border-text-on-brand/12",
              "bg-bg-card/28 backdrop-blur-2xl backdrop-saturate-150",
              "pt-3 sm:pt-4",
              "transition-[transform,box-shadow] duration-200",
              !reduceMotion && "hover:-translate-y-0.5",
            )}
            style={cardStyle}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `
                  linear-gradient(
                    145deg,
                    color-mix(in srgb, ${card.accent} 10%, transparent),
                    transparent 42%
                  ),
                  linear-gradient(
                    180deg,
                    color-mix(in srgb, var(--bg-card-elevated) 38%, transparent),
                    color-mix(in srgb, var(--bg-card) 18%, transparent)
                  )
                `,
              }}
              aria-hidden
            />

            <DotGrid accent={card.accent} />

            {/* Text stays above the graph zone so the sparkline never covers it */}
            <div className="relative z-10 flex flex-col gap-4 px-4 sm:px-4">
              <div className="flex items-start justify-between gap-2">
                <span
                  className="inline-flex size-10 items-center justify-center rounded-xl border backdrop-blur-md"
                  style={{
                    color: card.accent,
                    borderColor: `color-mix(in srgb, ${card.accent} 28%, transparent)`,
                    background: `color-mix(in srgb, ${card.accent} 16%, transparent)`,
                    boxShadow: `0 0 18px color-mix(in srgb, ${card.accent} 28%, transparent)`,
                  }}
                >
                  <Icon className="size-5" aria-hidden />
                </span>

                {change != null ? (
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 type-caption font-semibold backdrop-blur-md",
                      isUp && "border-success/30 bg-success/18 text-success",
                      isDown && "border-destructive/30 bg-destructive/18 text-destructive",
                      !isUp && !isDown && "border-border/50 bg-bg-hover/55 text-text-muted",
                    )}
                  >
                    {isUp ? (
                      <IoTrendingUp className="size-3.5" aria-hidden />
                    ) : isDown ? (
                      <IoTrendingDown className="size-3.5" aria-hidden />
                    ) : null}
                    {formatChangePercent(change)}
                  </span>
                ) : null}
              </div>

              <div className="space-y-3.5">
                <p className="type-overline text-text-muted">{t(card.labelKey)}</p>
                <div className="flex flex-wrap items-end gap-2 pt-1">
                  <p className="type-h1 font-semibold tracking-tight text-text-primary">
                    {card.format(card.metric?.value)}
                  </p>
                  <div className="mb-1 flex flex-wrap items-center gap-1">
                    <span className="inline-flex rounded-full border border-border/45 bg-bg-hover/45 px-2 py-0.5 type-caption-xs font-semibold text-text-secondary backdrop-blur-sm">
                      {previousValue}
                    </span>
                    <span className="type-caption text-text-muted">
                      {isPositionWorse ? t("positionWorseSuffix") : t("lastMonthLabel")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dedicated bottom slot — graph cannot overlap text */}
            <div className="relative z-0 mt-auto h-12 w-full shrink-0 px-2 pb-1 pt-0">
              <TrendSparkline
                id={card.id}
                accent={card.accent}
                values={card.metric?.sparkline ?? []}
                isUp={isUp}
                isDown={isDown}
                reduceMotion={reduceMotion}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
