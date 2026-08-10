"use client";

import type { CSSProperties } from "react";
import type { IconType } from "react-icons";

import { elevatedCardSurfaceClass } from "@/lib/frontend/layout/dashboard-chrome";
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

/** Formats metric counts for summary cards (Leads + SEO Activities). */
export function formatSummaryMetricCount(value: number): string {
  if (!Number.isFinite(value)) return "0";
  if (value >= 10_000) {
    return new Intl.NumberFormat(undefined, {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
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
        <div className="size-12 animate-pulse rounded-2xl border border-border/50 bg-bg-hover/60 sm:size-14" />
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
        const washStyle = {
          background: `radial-gradient(120% 100% at 100% 50%, color-mix(in srgb, ${card.accent} 18%, transparent), transparent 60%)`,
        } satisfies CSSProperties;
        const iconPlateStyle = {
          color: card.accent,
          background: `color-mix(in srgb, ${card.accent} 16%, transparent)`,
          borderColor: `color-mix(in srgb, ${card.accent} 34%, transparent)`,
        } satisfies CSSProperties;

        return (
          <div
            key={card.id}
            className={cn(
              elevatedCardSurfaceClass,
              "relative overflow-hidden rounded-2xl px-4 py-3.5 sm:px-5",
            )}
          >
            <div className="pointer-events-none absolute inset-0" style={washStyle} aria-hidden />

            <div className="relative flex items-center justify-between gap-3">
              <div className="type-stack-md min-w-0">
                <p className="truncate type-caption text-text-secondary">{card.label}</p>
                <p className="type-h1 font-semibold tracking-tight text-text-primary tabular-nums leading-none">
                  {card.value}
                </p>
              </div>

              <span
                className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl border shadow-sm backdrop-blur-md sm:size-14"
                style={iconPlateStyle}
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
