"use client";

import type { CSSProperties } from "react";
import type { IconType } from "react-icons";
import {
  IoDocumentTextOutline,
  IoFolderOpenOutline,
  IoGlobeOutline,
  IoLinkOutline,
} from "react-icons/io5";
import { useTranslation } from "react-i18next";

import type { TSeoActivitySummaryMetric } from "@/lib/frontend/seo-activities/summary.utils";
import { cn } from "@/lib/utils";

type TSeoActivitySummaryCardsProps = {
  metrics: TSeoActivitySummaryMetric[];
  className?: string;
};

type TMetricTheme = {
  icon: IconType;
  accent: string;
};

const METRIC_THEME: Record<TSeoActivitySummaryMetric["id"], TMetricTheme> = {
  blogs: {
    icon: IoDocumentTextOutline,
    accent: "var(--color-brand-primary)",
  },
  backlinks: {
    icon: IoLinkOutline,
    accent: "var(--color-secondary)",
  },
  web_changes: {
    icon: IoGlobeOutline,
    accent: "var(--status-invited)",
  },
  total: {
    icon: IoFolderOpenOutline,
    accent: "var(--status-active)",
  },
};

export function SeoActivitySummaryCards({ metrics, className }: TSeoActivitySummaryCardsProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.seoActivities.summary" });

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {metrics.map((metric) => {
        const theme = METRIC_THEME[metric.id];
        const Icon = theme.icon;

        const cardStyle = {
          ["--seo-neon" as string]: theme.accent,
          border: `1px solid color-mix(in srgb, ${theme.accent} 55%, transparent)`,
          boxShadow: `
            0 0 0 1px color-mix(in srgb, ${theme.accent} 18%, transparent),
            0 0 18px color-mix(in srgb, ${theme.accent} 18%, transparent),
            var(--shadow-elevated)
          `,
        } as CSSProperties;

        return (
          <div
            key={metric.id}
            className="seo-neon-card relative overflow-hidden rounded-2xl bg-bg-card-elevated px-5 py-5"
            style={cardStyle}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(75% 90% at 100% 50%, color-mix(in srgb, ${theme.accent} 26%, transparent), transparent 58%)`,
              }}
              aria-hidden
            />

            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border"
                  style={{
                    borderColor: `color-mix(in srgb, ${theme.accent} 42%, transparent)`,
                    background: `color-mix(in srgb, ${theme.accent} 12%, transparent)`,
                    color: theme.accent,
                  }}
                >
                  <Icon className="size-4" aria-hidden />
                </span>

                <p className="type-h2 text-text-primary">{metric.value}</p>
              </div>

              <p className="type-caption text-text-muted">{t(`cards.${metric.id}`)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
