"use client";

import type { IconType } from "react-icons";
import {
  IoEyeOutline,
  IoGlobeOutline,
  IoHandLeftOutline,
  IoPulseOutline,
  IoSearchOutline,
  IoStatsChartOutline,
} from "react-icons/io5";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import type { TAnalyticsOverviewDto } from "@/types/analytics.types";

type TAnalyticsSummaryCardsProps = {
  overview: TAnalyticsOverviewDto | undefined;
  isLoading?: boolean;
  className?: string;
};

type TSummaryLabelKey =
  | "clicks"
  | "impressions"
  | "ctr"
  | "position"
  | "sessions"
  | "organicSessions";

type TCardDef = {
  id: string;
  labelKey: TSummaryLabelKey;
  value: string;
  icon: IconType;
};

function formatNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);
}

function formatPercent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${(value * 100).toFixed(2)}%`;
}

function formatPosition(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toFixed(1);
}

export function AnalyticsSummaryCards({
  overview,
  isLoading,
  className,
}: TAnalyticsSummaryCardsProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.analytics.summary" });

  const cards: TCardDef[] = [
    {
      id: "clicks",
      labelKey: "clicks",
      value: formatNumber(overview?.gsc.clicks),
      icon: IoHandLeftOutline,
    },
    {
      id: "impressions",
      labelKey: "impressions",
      value: formatNumber(overview?.gsc.impressions),
      icon: IoEyeOutline,
    },
    {
      id: "ctr",
      labelKey: "ctr",
      value: formatPercent(overview?.gsc.ctr),
      icon: IoStatsChartOutline,
    },
    {
      id: "position",
      labelKey: "position",
      value: formatPosition(overview?.gsc.position),
      icon: IoSearchOutline,
    },
    {
      id: "sessions",
      labelKey: "sessions",
      value: formatNumber(overview?.ga4.sessions),
      icon: IoPulseOutline,
    },
    {
      id: "organicSessions",
      labelKey: "organicSessions",
      value: formatNumber(overview?.ga4.organicSessions),
      icon: IoGlobeOutline,
    },
  ];

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-3", className)}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="rounded-2xl border border-border bg-bg-card p-4 shadow-xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="type-caption text-text-muted">{t(card.labelKey)}</p>
                <p className="type-h2 text-text-primary">
                  {isLoading ? "…" : card.value}
                </p>
              </div>
              <span className="flex size-10 items-center justify-center rounded-xl bg-bg-hover text-brand">
                <Icon className="size-5" aria-hidden />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
