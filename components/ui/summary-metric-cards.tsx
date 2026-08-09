"use client";

import type { IconType } from "react-icons";

import { elevatedCardSurfaceClass, metricIconWellClass } from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

export type TSummaryMetricCard = {
  id: string;
  label: string;
  value: string;
  icon: IconType;
  accent: string;
};

type TSummaryMetricCardsProps = {
  cards: readonly TSummaryMetricCard[];
  isLoading?: boolean;
  className?: string;
};

/** Zero-pads small whole counts (`3` → `03`); compact for large totals. */
export function formatSummaryMetricCount(value: number): string {
  if (!Number.isFinite(value)) return "00";
  if (value >= 10_000) {
    return new Intl.NumberFormat(undefined, {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }
  if (Number.isInteger(value) && value >= 0 && value < 100) {
    return String(value).padStart(2, "0");
  }
  return new Intl.NumberFormat(undefined).format(value);
}

const SKELETON_KEYS = ["a", "b", "c", "d"] as const;

function CardSkeleton() {
  return (
    <div className={cn(elevatedCardSurfaceClass, "rounded-2xl px-4 py-3.5 sm:px-5")}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <div className="h-3 w-24 animate-pulse rounded bg-bg-hover/70" />
          <div className="h-7 w-12 animate-pulse rounded-lg bg-bg-hover/80" />
        </div>
        <div className={cn(metricIconWellClass, "size-12 animate-pulse sm:size-14")} />
      </div>
    </div>
  );
}

/** Compact premium metric strip — shared by Leads + SEO Activities. */
export function SummaryMetricCards({ cards, isLoading, className }: TSummaryMetricCardsProps) {
  if (isLoading) {
    const skeletonKeys = cards.length > 0 ? cards.map((card) => card.id) : SKELETON_KEYS;
    return (
      <div className={cn("grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4", className)}>
        {skeletonKeys.map((key) => (
          <CardSkeleton key={key} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4", className)}>
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.id}
            className={cn(elevatedCardSurfaceClass, "rounded-2xl px-4 py-3.5 sm:px-5")}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="type-stack-md min-w-0">
                <p className="truncate type-caption text-text-secondary">{card.label}</p>
                <p className="type-h1 font-semibold tracking-tight text-text-primary tabular-nums leading-none">
                  {card.value}
                </p>
              </div>

              <span
                className={cn(metricIconWellClass, "size-12 sm:size-14")}
                style={{ color: card.accent }}
                aria-hidden
              >
                <Icon className="size-6 sm:size-7" />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
