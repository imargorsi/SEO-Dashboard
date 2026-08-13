"use client";

import type { TAppIconComponent } from "@/components/ui/app-icon";
import { Icons } from "@/lib/frontend/icons/app-icons";

import { useTranslation } from "react-i18next";
import Link from "next/link";

import {
  elevatedCardSurfaceClass,
  typeStackMdClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import { formatSummaryMetricCount } from "@/components/ui/summary-metric-cards";
import { cn } from "@/lib/utils";

export type TDashboardSeoPulseValues = {
  leads: number | null;
  backlinks: number | null;
  pageViews: number | null;
  blogs: number | null;
};

type TPulseCardId = keyof TDashboardSeoPulseValues;

type TPulseCardDef = {
  id: TPulseCardId;
  labelKey: TPulseCardId;
  icon: TAppIconComponent;
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
        "flex h-full min-h-0 flex-col justify-between rounded-2xl",
        compact ? "gap-2 p-3 sm:p-3.5" : "gap-4 p-4 sm:p-5",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="h-3 w-16 animate-pulse rounded bg-bg-hover/70" />
        <div
          className={cn(
            "animate-pulse rounded-xl bg-bg-hover/70",
            compact ? "size-10" : "size-12",
          )}
        />
      </div>
      <div className="space-y-2">
        <div className={cn("animate-pulse rounded-lg bg-bg-hover/80", compact ? "h-7 w-14" : "h-9 w-20")} />
        <div className="h-3 w-28 animate-pulse rounded bg-bg-hover/60" />
      </div>
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
      icon: Icons.userGroup,
      accent: "var(--status-pending)",
      href: values.leads == null ? null : "/leads",
    },
    {
      id: "backlinks",
      labelKey: "backlinks",
      icon: Icons.link,
      accent: "var(--status-active)",
      href: values.backlinks == null ? null : "/seo-activities?type=backlinks",
    },
    {
      id: "pageViews",
      labelKey: "pageViews",
      icon: Icons.view,
      accent: "var(--color-secondary)",
      href: values.pageViews == null ? null : "/analytics",
    },
    {
      id: "blogs",
      labelKey: "blogs",
      icon: Icons.file,
      accent: "var(--status-invited)",
      href: values.blogs == null ? null : "/seo-activities?type=blogs",
    },
  ];

  const gridClass = cn(
    "grid h-full min-h-0 grid-cols-2",
    compact ? "gap-2.5" : "gap-3 sm:gap-4",
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
        const raw = values[card.id];
        const display = formatValue(raw);
        const description =
          raw == null
            ? t("descriptions.unavailable")
            : t(`descriptions.${card.labelKey}`, { count: display });

        const content = (
          <>
            <div
              className="pointer-events-none absolute inset-0 opacity-90"
              style={{
                background: `
                  radial-gradient(120% 80% at 100% 0%, color-mix(in srgb, ${card.accent} 16%, transparent), transparent 55%),
                  linear-gradient(180deg, color-mix(in srgb, var(--text-primary) 4%, transparent), transparent 42%)
                `,
              }}
              aria-hidden
            />

            <div className="relative z-10 flex items-start justify-between gap-2">
              <p className="type-caption font-medium text-text-secondary">
                {t(`cards.${card.labelKey}`)}
              </p>
              <span
                className={cn(
                  "inline-flex shrink-0 items-center justify-center rounded-xl border backdrop-blur-md",
                  compact ? "size-10" : "size-12",
                )}
                style={{
                  color: card.accent,
                  borderColor: `color-mix(in srgb, ${card.accent} 45%, transparent)`,
                  background: `color-mix(in srgb, ${card.accent} 16%, transparent)`,
                }}
                aria-hidden
              >
                <Icon className={compact ? "size-5" : "size-6"} />
              </span>
            </div>

            <div className={cn(typeStackMdClass, "relative z-10 mt-auto min-w-0")}>
              <p
                className={cn(
                  "font-semibold tracking-tight text-text-primary tabular-nums leading-none",
                  compact ? "type-h2" : "type-h1",
                )}
              >
                {display}
              </p>
              <p className="line-clamp-2 type-caption leading-snug text-text-muted">
                {description}
              </p>
            </div>

            {card.href ? (
              <span
                className="absolute bottom-2.5 inset-e-2.5 z-10 inline-flex size-6 items-center justify-center rounded-full border border-border/40 bg-bg-card/30 text-text-muted opacity-70 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-hover:text-brand"
                aria-hidden
              >
                <Icons.arrowRight className="size-3" />
              </span>
            ) : null}

            <span
              className="pointer-events-none absolute inset-x-3 bottom-0 z-10 h-px"
              style={{
                background: `linear-gradient(90deg, transparent, color-mix(in srgb, ${card.accent} 75%, transparent), transparent)`,
              }}
              aria-hidden
            />
          </>
        );

        const shellClass = cn(
          elevatedCardSurfaceClass,
          "group relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl",
          "bg-bg-card/20 dark:bg-text-primary/5",
          compact ? "gap-2 p-3 sm:p-3.5" : "min-h-36 gap-3 p-4 sm:p-5",
          card.href &&
            "transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-accent-border/55 hover:bg-bg-card/35 dark:hover:bg-text-primary/8",
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
