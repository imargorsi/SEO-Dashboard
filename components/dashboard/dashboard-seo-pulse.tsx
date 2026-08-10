"use client";

import type { IconType } from "react-icons";
import {
  IoDocumentTextOutline,
  IoLinkOutline,
  IoPeopleOutline,
  IoStatsChartOutline,
} from "react-icons/io5";
import { useTranslation } from "react-i18next";
import Link from "next/link";

import {
  elevatedCardSurfaceClass,
  metricIconWellClass,
  typeStackMdClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import { formatSummaryMetricCount } from "@/components/ui/summary-metric-cards";
import { cn } from "@/lib/utils";

export type TDashboardSeoPulseValues = {
  leads: number | null;
  backlinks: number | null;
  clicks: number | null;
  blogs: number | null;
};

type TPulseCardId = keyof TDashboardSeoPulseValues;

type TPulseCardDef = {
  id: TPulseCardId;
  labelKey: TPulseCardId;
  icon: IconType;
  accent: string;
  href: string | null;
};

type TDashboardSeoPulseProps = {
  values: TDashboardSeoPulseValues;
  isLoading?: boolean;
  className?: string;
  /** Tighter cards for no-scroll `/dashboard` layout. */
  compact?: boolean;
};

function formatValue(value: number | null): string {
  if (value == null) return "—";
  return formatSummaryMetricCount(value);
}

function CardSkeleton({ compact }: { compact: boolean }) {
  return (
    <div
      className={cn(
        elevatedCardSurfaceClass,
        "flex h-full min-h-0 flex-col rounded-2xl",
        compact ? "gap-2 p-3" : "gap-4 p-4 sm:p-5",
      )}
    >
      <div className={cn("animate-pulse rounded-xl bg-bg-hover/70", compact ? "size-8" : "size-10")} />
      <div className="h-3 w-20 animate-pulse rounded bg-bg-hover/70" />
      <div className="h-7 w-14 animate-pulse rounded-lg bg-bg-hover/80" />
    </div>
  );
}

export function DashboardSeoPulse({
  values,
  isLoading,
  className,
  compact = false,
}: TDashboardSeoPulseProps) {
  const { t } = useTranslation("translation", { keyPrefix: "home.pulse" });

  const cards: TPulseCardDef[] = [
    {
      id: "leads",
      labelKey: "leads",
      icon: IoPeopleOutline,
      accent: "var(--status-pending)",
      href: values.leads == null ? null : "/leads",
    },
    {
      id: "backlinks",
      labelKey: "backlinks",
      icon: IoLinkOutline,
      accent: "var(--status-active)",
      href: values.backlinks == null ? null : "/seo-activities?type=backlinks",
    },
    {
      id: "clicks",
      labelKey: "clicks",
      icon: IoStatsChartOutline,
      accent: "var(--brand)",
      href: values.clicks == null ? null : "/analytics",
    },
    {
      id: "blogs",
      labelKey: "blogs",
      icon: IoDocumentTextOutline,
      accent: "var(--status-invited)",
      href: values.blogs == null ? null : "/seo-activities?type=blogs",
    },
  ];

  const gridClass = cn(
    "grid h-full min-h-0 grid-cols-2",
    compact ? "gap-2 sm:gap-3" : "gap-3 sm:gap-4",
    className,
  );

  if (isLoading) {
    return (
      <div className={gridClass}>
        {cards.map((card) => (
          <CardSkeleton key={card.id} compact={compact} />
        ))}
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {cards.map((card) => {
        const Icon = card.icon;
        const content = (
          <>
            <span
              className={cn(metricIconWellClass, compact ? "mb-2 size-8" : "mb-3")}
              style={{
                color: card.accent,
                borderColor: `color-mix(in srgb, ${card.accent} 40%, transparent)`,
              }}
              aria-hidden
            >
              <Icon className={compact ? "size-4" : "size-5"} />
            </span>
            <div className={typeStackMdClass}>
              <p className="type-caption text-text-secondary">{t(`cards.${card.labelKey}`)}</p>
              <p
                className={cn(
                  "font-semibold tracking-tight text-text-primary tabular-nums leading-none",
                  compact ? "type-title" : "type-h1",
                )}
              >
                {formatValue(values[card.id])}
              </p>
            </div>
            <span
              className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 opacity-80"
              style={{ background: card.accent }}
              aria-hidden
            />
          </>
        );

        const shellClass = cn(
          elevatedCardSurfaceClass,
          "relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl",
          compact ? "p-3" : "min-h-36 p-4 sm:p-5",
          card.href && "transition-[border-color] hover:border-accent-border/60",
        );

        if (card.href) {
          return (
            <Link key={card.id} href={card.href} className={shellClass}>
              {content}
            </Link>
          );
        }

        return (
          <div key={card.id} className={shellClass}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
