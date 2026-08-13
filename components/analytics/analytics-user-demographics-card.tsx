"use client";

import { Icons } from "@/lib/frontend/icons/app-icons";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { WorldChoroplethMap } from "@/components/analytics/world-choropleth-map";
import { EmptyState } from "@/components/ui/empty-state";
import {
  analyticsHeadingStackClass,
  analyticsPanelClass,
  elevatedCardSurfaceClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import {
  countryNameToIsoNumeric,
  formatCompactUsers,
} from "@/lib/frontend/analytics/country-iso.utils";
import { cn } from "@/lib/utils";
import type { TAnalyticsDimensionRowDto } from "@/types/analytics.types";

type TAnalyticsUserDemographicsCardProps = {
  rows: TAnalyticsDimensionRowDto[];
  isLoading?: boolean;
  className?: string;
};

const RANK_COLORS = [
  "var(--color-secondary)",
  "var(--gradient-mid)",
  "var(--color-brand-primary)",
  "var(--status-invited)",
  "var(--status-active)",
  "var(--status-pending)",
] as const;

type TCountryStat = {
  name: string;
  isoNumeric: string | null;
  users: number;
  color: string;
};

function buildCountryStats(rows: TAnalyticsDimensionRowDto[]): TCountryStat[] {
  return rows
    .map((row) => ({
      name: row.dimensionValue,
      isoNumeric: countryNameToIsoNumeric(row.dimensionValue),
      users: row.totalUsers ?? row.sessions ?? 0,
    }))
    .filter((row) => row.users > 0)
    .sort((a, b) => b.users - a.users)
    .map((row, index) => ({
      ...row,
      color: RANK_COLORS[index % RANK_COLORS.length]!,
    }));
}

export function AnalyticsUserDemographicsCard({
  rows,
  isLoading,
  className,
}: TAnalyticsUserDemographicsCardProps) {
  const { t } = useTranslation("translation", {
    keyPrefix: "modules.analytics.demographics",
  });
  const [selectedIso, setSelectedIso] = useState<string | null>(null);

  const countries = useMemo(() => buildCountryStats(rows), [rows]);
  const totalUsers = useMemo(
    () => countries.reduce((sum, row) => sum + row.users, 0),
    [countries],
  );
  const topCountries = countries.slice(0, 6);
  const leading = countries[0] ?? null;

  const selectedCountry =
    countries.find((row) => row.isoNumeric && row.isoNumeric === selectedIso) ?? leading;

  const fillsByIsoNumeric = useMemo(() => {
    const fills: Record<string, string> = {};
    for (const country of countries) {
      if (!country.isoNumeric) continue;
      fills[country.isoNumeric] = country.color;
    }
    return fills;
  }, [countries]);

  return (
    <section
      className={cn(
        elevatedCardSurfaceClass,
        analyticsPanelClass,
        "flex h-full min-h-0 flex-col",
        className,
      )}
      aria-labelledby="analytics-demographics-title"
    >
      {isLoading ? (
        <p className="type-caption text-text-muted">{t("loading")}</p>
      ) : countries.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("emptyBody")} />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-7 lg:flex-row lg:items-stretch lg:gap-8">
          <div className="flex w-full shrink-0 flex-col gap-6 lg:w-[min(100%,17.5rem)] lg:max-w-[40%]">
            <div className={analyticsHeadingStackClass}>
              <h2 id="analytics-demographics-title" className="type-title text-text-primary">
                {t("title")}
              </h2>
              <p className="type-caption text-text-muted">{t("subtitle")}</p>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-end gap-2">
                <p className="type-h1 font-semibold tracking-tight text-text-primary">
                  {formatCompactUsers(totalUsers)}
                </p>
                {leading ? (
                  <span className="mb-1 inline-flex items-center gap-1 type-caption font-medium text-success">
                    <Icons.arrowUp className="size-3.5" aria-hidden />
                    {leading.name}
                  </span>
                ) : null}
              </div>
              <p className="type-caption text-text-muted">{t("metricHint")}</p>
            </div>

            <ul className="space-y-2.5" aria-label={t("listAria")}>
              {topCountries.map((country) => {
                const isActive =
                  selectedCountry?.name === country.name ||
                  (selectedIso != null && country.isoNumeric === selectedIso);
                return (
                  <li key={country.name}>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedIso(
                          country.isoNumeric && selectedIso === country.isoNumeric
                            ? null
                            : country.isoNumeric,
                        )
                      }
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-start transition-colors",
                        isActive
                          ? "border-border bg-bg-hover/60"
                          : "border-transparent hover:border-border/50 hover:bg-bg-hover/35",
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: country.color }}
                          aria-hidden
                        />
                        <span className="truncate type-label text-text-primary">
                          {country.name}
                        </span>
                      </span>
                      <span className="shrink-0 type-label font-semibold text-text-primary">
                        {formatCompactUsers(country.users)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="relative min-h-80 w-full flex-1 sm:min-h-112 lg:min-h-0">
            <div className="absolute inset-0 overflow-hidden rounded-2xl bg-bg-card/20 p-1 sm:p-2">
              <WorldChoroplethMap
                fillsByIsoNumeric={fillsByIsoNumeric}
                selectedIsoNumeric={selectedCountry?.isoNumeric ?? selectedIso}
                onSelectIsoNumeric={setSelectedIso}
                unavailableLabel={t("mapUnavailable")}
                ariaLabel={t("mapAria")}
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
