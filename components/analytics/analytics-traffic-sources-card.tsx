"use client";

import { useId, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Cell, Pie, PieChart } from "recharts";

import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { EmptyState } from "@/components/ui/empty-state";
import {
  analyticsPanelClass,
  elevatedCardSurfaceClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";
import type { TAnalyticsDimensionRowDto } from "@/types/analytics.types";

type TAnalyticsTrafficSourcesCardProps = {
  rows: TAnalyticsDimensionRowDto[];
  isLoading?: boolean;
  className?: string;
};

const CHANNEL_COLORS = [
  "var(--color-secondary)",
  "var(--gradient-mid)",
  "var(--color-brand-primary)",
  "var(--status-invited)",
  "var(--status-active)",
  "var(--status-pending)",
] as const;

type TChannelSlice = {
  key: string;
  name: string;
  value: number;
  percent: number;
  fill: string;
};

function buildChannelSlices(rows: TAnalyticsDimensionRowDto[]): TChannelSlice[] {
  const totals = rows
    .map((row) => ({
      name: row.dimensionValue,
      value: row.sessions ?? 0,
    }))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value);

  const grandTotal = totals.reduce((sum, row) => sum + row.value, 0);
  if (grandTotal <= 0) return [];

  return totals.map((row, index) => ({
    key: row.name,
    name: row.name,
    value: row.value,
    percent: (row.value / grandTotal) * 100,
    fill: CHANNEL_COLORS[index % CHANNEL_COLORS.length]!,
  }));
}

export function AnalyticsTrafficSourcesCard({
  rows,
  isLoading,
  className,
}: TAnalyticsTrafficSourcesCardProps) {
  const { t } = useTranslation("translation", {
    keyPrefix: "modules.analytics.trafficSources",
  });
  const chartId = useId().replace(/:/g, "");

  const slices = useMemo(() => buildChannelSlices(rows), [rows]);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    for (const slice of slices) {
      config[slice.key] = { label: slice.name, color: slice.fill };
    }
    return config;
  }, [slices]);

  return (
    <section
      className={cn(elevatedCardSurfaceClass, analyticsPanelClass, className)}
      aria-labelledby="analytics-traffic-sources-title"
    >
      <h2 id="analytics-traffic-sources-title" className="type-title text-text-primary">
        {t("title")}
      </h2>

      {isLoading ? (
        <p className="mt-5 type-caption text-text-muted">{t("loading")}</p>
      ) : slices.length === 0 ? (
        <div className="mt-5">
          <EmptyState title={t("emptyTitle")} description={t("emptyBody")} />
        </div>
      ) : (
        <div className="mt-5 flex flex-col items-center gap-7">
          <ChartContainer
            config={chartConfig}
            className="aspect-square h-52 w-52"
            initialDimension={{ width: 208, height: 208 }}
          >
            <PieChart>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="name"
                innerRadius={66}
                outerRadius={92}
                strokeWidth={0}
                paddingAngle={2}
              >
                {slices.map((slice) => (
                  <Cell key={slice.key} fill={slice.fill} />
                ))}
              </Pie>
              <text
                x="50%"
                y="46%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-text-muted type-caption-xs uppercase"
              >
                {t("totalLabel")}
              </text>
              <text
                x="50%"
                y="58%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-text-primary type-title font-semibold"
              >
                100%
              </text>
            </PieChart>
          </ChartContainer>

          <ul className="w-full space-y-2.5" aria-label={t("legendAria")}>
            {slices.map((slice) => (
              <li key={`${chartId}-${slice.key}`} className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: slice.fill }}
                    aria-hidden
                  />
                  <span className="truncate type-caption text-text-muted">{slice.name}</span>
                </span>
                <span className="shrink-0 type-label font-semibold text-text-primary">
                  {`${slice.percent.toFixed(0)}%`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
