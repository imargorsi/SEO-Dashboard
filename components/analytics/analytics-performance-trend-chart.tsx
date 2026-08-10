"use client";

import { useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  analyticsHeadingStackClass,
  analyticsPanelClass,
  elevatedCardSurfaceClass,
  toolbarFilterChipClass,
  toolbarFilterShellClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import {
  ANALYTICS_TREND_METRICS,
  buildAnalyticsTrendPoints,
  formatTrendAxisLabel,
  formatTrendMetricValue,
  formatTrendTooltipDate,
  pickTrendTickIndexes,
  type TAnalyticsTrendMetric,
  type TAnalyticsTrendPoint,
} from "@/lib/frontend/analytics/performance-trend.utils";
import { cn } from "@/lib/utils";
import type { TAnalyticsOverviewDto } from "@/types/analytics.types";

type TAnalyticsPerformanceTrendChartProps = {
  overview: TAnalyticsOverviewDto | undefined;
  isLoading?: boolean;
  className?: string;
  /** Tighter chrome + shorter plot for `/dashboard` no-scroll layout. */
  compact?: boolean;
  /** Stretch to parent height (dashboard 50/50 split). */
  fill?: boolean;
  /** Hide in-card title/subtitle (dashboard renders them outside the chart). */
  hideTitle?: boolean;
  /** Overrides default `analytics-trend-title` when the heading lives outside. */
  labelledBy?: string;
};

type TChartRow = TAnalyticsTrendPoint;

function TrendTooltip({
  active,
  payload,
  metric,
  monthLabels,
  increaseLabel,
  decreaseLabel,
  flatLabel,
}: {
  active?: boolean;
  payload?: Array<{ payload?: TChartRow }>;
  metric: TAnalyticsTrendMetric;
  monthLabels: readonly string[];
  increaseLabel: string;
  decreaseLabel: string;
  flatLabel: string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  const change = point.changePercent;
  const isUp = change != null && change > 0;
  const isDown = change != null && change < 0;
  const changeText =
    change == null
      ? null
      : `${change > 0 ? "+" : ""}${change.toFixed(1)}% ${
          isUp ? increaseLabel : isDown ? decreaseLabel : flatLabel
        }`;

  return (
    <div className="min-w-36 rounded-xl border border-border/60 bg-bg-card/95 px-3 py-2.5 shadow-lg backdrop-blur-md">
      <p className="type-caption-xs font-medium tracking-wide text-text-muted">
        {formatTrendTooltipDate(point.date, monthLabels)}
      </p>
      <div className="mt-1.5 flex items-center gap-2">
        <span
          className="size-2 shrink-0 rounded-full bg-brand"
          aria-hidden
        />
        <p className="type-title font-semibold text-text-primary">
          {formatTrendMetricValue(metric, point.value)}
        </p>
      </div>
      {changeText ? (
        <p
          className={cn(
            "mt-1 type-caption font-medium",
            isUp && "text-success",
            isDown && "text-destructive",
            !isUp && !isDown && "text-text-muted",
          )}
        >
          {changeText}
        </p>
      ) : null}
    </div>
  );
}

export function AnalyticsPerformanceTrendChart({
  overview,
  isLoading,
  className,
  compact = false,
  fill = false,
  hideTitle = false,
  labelledBy,
}: TAnalyticsPerformanceTrendChartProps) {
  const { t } = useTranslation("translation", {
    keyPrefix: "modules.analytics.trendChart",
  });
  const { t: tMonths } = useTranslation("translation", {
    keyPrefix: "modules.analytics.dateFilter",
  });
  const gradientId = useId().replace(/:/g, "");
  const [metric, setMetric] = useState<TAnalyticsTrendMetric>("clicks");

  const monthLabels = tMonths("months", { returnObjects: true }) as string[];
  const chartHeightClass = fill
    ? "h-full min-h-0"
    : compact
      ? "h-36 sm:h-40"
      : "h-72";
  const chartHeightPx = fill ? 220 : compact ? 160 : 288;
  const titleId = labelledBy ?? "analytics-trend-title";

  const chartConfig = {
    value: {
      label: t(`tabs.${metric}`),
      color: "var(--color-brand-primary)",
    },
  } satisfies ChartConfig;

  const points = useMemo(() => {
    if (!overview) return [];
    return buildAnalyticsTrendPoints(overview.series, overview.from, overview.to, metric);
  }, [metric, overview]);

  const tickIndexes = useMemo(
    () => new Set(pickTrendTickIndexes(points.length)),
    [points.length],
  );

  const hasSignal = points.some((point) => point.raw != null);

  return (
    <section
      className={cn(
        elevatedCardSurfaceClass,
        compact || fill ? "rounded-2xl p-3 sm:p-4" : analyticsPanelClass,
        fill && "flex h-full min-h-0 flex-col overflow-hidden",
        className,
      )}
      aria-labelledby={titleId}
    >
      <div
        className={cn(
          "flex shrink-0 flex-col sm:flex-row sm:items-start",
          hideTitle ? "sm:justify-end" : "sm:justify-between",
          compact || fill ? "gap-2 sm:gap-3" : "gap-4 sm:gap-5",
        )}
      >
        {hideTitle ? null : (
          <div className={cn(analyticsHeadingStackClass, "min-w-0")}>
            <h2 id={titleId} className="type-title text-text-primary">
              {t("title")}
            </h2>
            {compact || fill ? null : (
              <p className="type-caption text-text-muted">{t("subtitle")}</p>
            )}
          </div>
        )}

        <div
          className={cn(toolbarFilterShellClass, "shrink-0")}
          role="tablist"
          aria-label={t("tabsAria")}
        >
          {ANALYTICS_TREND_METRICS.map((id) => {
            const isActive = metric === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setMetric(id)}
                className={cn(
                  toolbarFilterChipClass,
                  isActive
                    ? "bg-brand text-text-on-brand"
                    : "text-text-secondary hover:bg-bg-hover hover:text-text-primary",
                )}
              >
                {t(`tabs.${id}`)}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className={cn(
          fill ? "mt-2 flex min-h-0 flex-1 flex-col sm:mt-3" : compact ? "mt-3" : "mt-6",
        )}
      >
        {isLoading && !overview ? (
          <Skeleton className={cn("w-full rounded-2xl", chartHeightClass)} />
        ) : !hasSignal ? (
          <EmptyState title={t("emptyTitle")} description={t("emptyBody")} />
        ) : (
          <ChartContainer
            config={chartConfig}
            className={cn("aspect-auto w-full", chartHeightClass)}
            initialDimension={{ width: 640, height: chartHeightPx }}
          >
            <AreaChart
              data={points}
              margin={{ top: 12, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id={`trend-stroke-${gradientId}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor="var(--color-secondary)" />
                  <stop offset="100%" stopColor="var(--color-secondary)" />
                </linearGradient>
                <linearGradient
                  id={`trend-fill-${gradientId}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--color-secondary)"
                    stopOpacity={0.18}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-secondary)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="var(--border)"
                strokeOpacity={0.45}
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={24}
                ticks={points
                  .filter((_, index) => tickIndexes.has(index))
                  .map((row) => row.date)}
                tickFormatter={(date: string) =>
                  overview
                    ? formatTrendAxisLabel(date, overview.from, overview.to, monthLabels)
                    : date
                }
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              />
              <YAxis
                hide
                domain={["auto", "auto"]}
                reversed={metric === "position"}
              />
              <ChartTooltip
                cursor={{
                  stroke: "var(--border)",
                  strokeDasharray: "4 4",
                }}
                content={(props) => {
                  const tooltipPayload = props.payload as
                    | ReadonlyArray<{ payload?: TChartRow }>
                    | undefined;
                  return (
                    <TrendTooltip
                      active={props.active}
                      payload={tooltipPayload ? [...tooltipPayload] : undefined}
                      metric={metric}
                      monthLabels={monthLabels}
                      increaseLabel={t("changeIncrease")}
                      decreaseLabel={t("changeDecrease")}
                      flatLabel={t("changeFlat")}
                    />
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={`url(#trend-stroke-${gradientId})`}
                strokeWidth={3}
                fill={`url(#trend-fill-${gradientId})`}
                activeDot={{
                  r: 5.5,
                  fill: "var(--text-on-brand)",
                  stroke: "var(--color-brand-primary)",
                  strokeWidth: 2,
                }}
                dot={false}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </div>
    </section>
  );
}
