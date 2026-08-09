"use client";

import { useTranslation } from "react-i18next";
import type { IconType } from "react-icons";
import {
  IoCalendarOutline,
  IoPeopleOutline,
  IoTodayOutline,
  IoTimeOutline,
} from "react-icons/io5";

import { elevatedCardSurfaceClass, metricIconWellClass } from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";
import type { TLeadSummaryCounts } from "@/types/lead.types";

type TLeadsSummaryCardsProps = {
  counts: TLeadSummaryCounts;
  isLoading?: boolean;
  className?: string;
};

type TCardId = "total" | "thisMonth" | "lastMonth" | "thisYear";

type TCardDef = {
  id: TCardId;
  labelKey: TCardId;
  icon: IconType;
  accent: string;
  value: number;
};

function formatCount(value: number): string {
  return new Intl.NumberFormat(undefined, {
    notation: value >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: value >= 10_000 ? 1 : 0,
  }).format(value);
}

function CardSkeleton() {
  return (
    <div className={cn(elevatedCardSurfaceClass, "min-h-40 rounded-2xl px-4 pb-5 pt-4 sm:px-5 sm:pt-5")}>
      <div className="flex flex-col gap-3">
        <div className="size-10 animate-pulse rounded-xl bg-bg-hover/70" />
        <div className="h-3 w-24 animate-pulse rounded bg-bg-hover/70" />
        <div className="h-9 w-16 animate-pulse rounded-lg bg-bg-hover/80" />
      </div>
    </div>
  );
}

export function LeadsSummaryCards({ counts, isLoading, className }: TLeadsSummaryCardsProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.leads.summary" });

  const cards: TCardDef[] = [
    {
      id: "total",
      labelKey: "total",
      icon: IoPeopleOutline,
      accent: "var(--brand)",
      value: counts.total,
    },
    {
      id: "thisMonth",
      labelKey: "thisMonth",
      icon: IoTodayOutline,
      accent: "var(--status-pending)",
      value: counts.this_month,
    },
    {
      id: "lastMonth",
      labelKey: "lastMonth",
      icon: IoTimeOutline,
      accent: "var(--status-active)",
      value: counts.last_month,
    },
    {
      id: "thisYear",
      labelKey: "thisYear",
      icon: IoCalendarOutline,
      accent: "var(--color-brand-primary)",
      value: counts.this_year,
    },
  ];

  if (isLoading) {
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
              "flex min-h-40 flex-col overflow-hidden rounded-2xl pt-4 sm:pt-5",
            )}
          >
            <div className="flex flex-col gap-4 px-4 pb-5 sm:px-5">
              <span className={metricIconWellClass} style={{ color: card.accent }}>
                <Icon className="size-5" aria-hidden />
              </span>
              <div className="flex flex-col gap-3">
                <p className="type-overline text-text-muted">{t(card.labelKey)}</p>
                <p className="type-h1 font-semibold tracking-tight text-text-primary">
                  {formatCount(card.value)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
