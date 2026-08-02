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
      className={cn(elevatedCardSurfaceClass, analyticsPanelClass, className)}
      aria-labelledby="analytics-trend-title"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
        <div className={cn(analyticsHeadingStackClass, "min-w-0")}>
          <h2 id="analytics-trend-title" className="type-title text-text-primary">
            {t("title")}
          </h2>
          <p className="type-caption text-text-muted">{t("subtitle")}</p>
        </div>

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

      <div className="mt-6">
        {isLoading && !overview ? (
          <Skeleton className="h-72 w-full rounded-2xl" />
        ) : !hasSignal ? (
          <EmptyState title={t("emptyTitle")} description={t("emptyBody")} />
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-72 w-full"
            initialDimension={{ width: 640, height: 288 }}
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
                  <stop offset="50%" stopColor="var(--gradient-mid)" />
                  <stop offset="100%" stopColor="var(--color-brand-primary)" />
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
                    stopColor="var(--color-brand-primary)"
                    stopOpacity={0.28}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-brand-primary)"
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
