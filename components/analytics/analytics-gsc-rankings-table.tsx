"use client";

import { useTranslation } from "react-i18next";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import type { TAnalyticsDimensionRowDto } from "@/types/analytics.types";

type TAnalyticsGscRankingsTableProps = {
  rows: TAnalyticsDimensionRowDto[];
  i18nKey: "topQueries" | "topPages";
  isLoading?: boolean;
  /** Show a leading rank column. */
  showRank?: boolean;
  /** Sticky header for scroll containers. */
  stickyHeader?: boolean;
  className?: string;
  emptyTitle?: string;
  emptyBody?: string;
};

export function formatAnalyticsCount(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);
}

export function formatAnalyticsPercent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

export function formatAnalyticsPosition(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toFixed(1);
}

export function AnalyticsGscRankingsTable({
  rows,
  i18nKey,
  isLoading,
  showRank = false,
  stickyHeader = false,
  className,
  emptyTitle,
  emptyBody,
}: TAnalyticsGscRankingsTableProps) {
  const { t } = useTranslation("translation", {
    keyPrefix: `modules.analytics.${i18nKey}`,
  });

  if (isLoading) {
    return <p className="type-caption text-text-muted">{t("loading")}</p>;
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title={emptyTitle ?? t("emptyTitle")}
        description={emptyBody ?? t("emptyBody")}
      />
    );
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <Table>
        <TableHeader
          className={cn(
            stickyHeader &&
              "sticky top-0 z-10 bg-bg-card [&_tr]:border-border/50 [&_tr]:hover:bg-transparent",
          )}
        >
          <TableRow className="border-border/40 hover:bg-transparent">
            {showRank ? (
              <TableHead className="w-12 type-overline text-text-muted">#</TableHead>
            ) : null}
            <TableHead className="type-overline text-text-muted">
              {t("columns.dimension")}
            </TableHead>
            <TableHead className="type-overline text-text-muted">{t("columns.clicks")}</TableHead>
            <TableHead className="type-overline text-text-muted">
              {t("columns.impressions")}
            </TableHead>
            <TableHead className="type-overline text-text-muted">{t("columns.ctr")}</TableHead>
            <TableHead className="type-overline text-end text-text-muted">
              {t("columns.position")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={row.dimensionValue} className="border-border/30">
              {showRank ? (
                <TableCell className="tabular-nums text-text-muted">{index + 1}</TableCell>
              ) : null}
              <TableCell
                className={cn(
                  "font-medium text-text-primary",
                  showRank ? "max-w-md break-all sm:wrap-break-word" : "max-w-55 truncate",
                )}
                title={row.dimensionValue}
              >
                {row.dimensionValue}
              </TableCell>
              <TableCell className="tabular-nums text-text-secondary">
                {formatAnalyticsCount(row.clicks)}
              </TableCell>
              <TableCell className="tabular-nums text-text-secondary">
                {formatAnalyticsCount(row.impressions)}
              </TableCell>
              <TableCell>
                <span className="inline-flex rounded-full border border-border/50 bg-bg-hover/50 px-2.5 py-0.5 type-caption font-semibold text-text-primary">
                  {formatAnalyticsPercent(row.ctr)}
                </span>
              </TableCell>
              <TableCell className="text-end tabular-nums text-text-secondary">
                {formatAnalyticsPosition(row.position)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
