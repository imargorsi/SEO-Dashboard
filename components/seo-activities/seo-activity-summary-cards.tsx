"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import type { IconType } from "react-icons";
import {
  IoCalendarOutline,
  IoConstructOutline,
  IoDocumentTextOutline,
  IoLinkOutline,
} from "react-icons/io5";
import { useTranslation } from "react-i18next";

import { buildSeoActivitySparklinePaths } from "@/lib/frontend/seo-activities/sparkline.utils";
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
  technical_work: {
    icon: IoConstructOutline,
    accent: "var(--status-invited)",
  },
  total: {
    icon: IoCalendarOutline,
    accent: "var(--status-active)",
  },
};

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

function MetricSparkline({
  id,
  accent,
  delayMs = 0,
  reduceMotion,
}: {
  id: TSeoActivitySummaryMetric["id"];
  accent: string;
  delayMs?: number;
  reduceMotion: boolean;
}) {
  const width = 88;
  const height = 40;
  const { line, area, lineAlt, areaAlt } = buildSeoActivitySparklinePaths(id, width, height);
  const gradId = `seo-spark-fill-${id}`;
  const sparkStyle = { ["--seo-spark-delay" as string]: `${delayMs}ms` } as CSSProperties;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="seo-sparkline shrink-0 overflow-hidden"
      style={sparkStyle}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: accent, stopOpacity: 0.42 }} />
          <stop offset="100%" style={{ stopColor: accent, stopOpacity: 0 }} />
        </linearGradient>
      </defs>

      <g className={cn(!reduceMotion && "seo-sparkline-wave")}>
        <path className={cn("seo-sparkline-area", !reduceMotion && "seo-sparkline-area-live")} d={area} fill={`url(#${gradId})`}>
          {!reduceMotion ? (
            <animate
              attributeName="d"
              values={`${area};${areaAlt};${area}`}
              dur="7.5s"
              begin={`${delayMs}ms`}
              repeatCount="indefinite"
              calcMode="spline"
              keyTimes="0;0.5;1"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
            />
          ) : null}
        </path>

        <path
          d={line}
          fill="none"
          stroke={accent}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {!reduceMotion ? (
            <animate
              attributeName="d"
              values={`${line};${lineAlt};${line}`}
              dur="7.5s"
              begin={`${delayMs}ms`}
              repeatCount="indefinite"
              calcMode="spline"
              keyTimes="0;0.5;1"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
            />
          ) : null}
        </path>
      </g>
    </svg>
  );
}

export function SeoActivitySummaryCards({ metrics, className }: TSeoActivitySummaryCardsProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.seoActivities.summary" });
  const reduceMotion = usePrefersReducedMotion();

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {metrics.map((metric, index) => {
        const theme = METRIC_THEME[metric.id];
        const Icon = theme.icon;

        const cardStyle = {
          borderColor: `color-mix(in srgb, ${theme.accent} 28%, var(--border))`,
          boxShadow: `
            0 0 0 1px color-mix(in srgb, ${theme.accent} 10%, transparent),
            0 10px 28px color-mix(in srgb, ${theme.accent} 10%, transparent),
            var(--shadow-elevated)
          `,
        } as CSSProperties;

        return (
          <div
            key={metric.id}
            className="relative overflow-hidden rounded-2xl border bg-bg-card-elevated px-4 py-4 sm:px-5"
            style={cardStyle}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(70% 120% at 100% 0%, color-mix(in srgb, ${theme.accent} 16%, transparent), transparent 55%)`,
              }}
              aria-hidden
            />

            <div className="relative z-10 flex items-center gap-3">
              <span
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl"
                style={{
                  color: theme.accent,
                  background: `color-mix(in srgb, ${theme.accent} 16%, transparent)`,
                  boxShadow: `0 0 18px color-mix(in srgb, ${theme.accent} 35%, transparent)`,
                }}
              >
                <Icon className="size-5" aria-hidden />
              </span>

              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <p className="type-h2 text-text-primary tabular-nums leading-none">{metric.value}</p>
                <p className="type-caption text-text-muted">{t(`cards.${metric.id}`)}</p>
              </div>

              <MetricSparkline
                id={metric.id}
                accent={theme.accent}
                delayMs={index * 400}
                reduceMotion={reduceMotion}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
