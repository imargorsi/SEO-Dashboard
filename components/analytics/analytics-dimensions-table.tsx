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

type TAnalyticsDimensionsTableProps = {
  title: string;
  rows: TAnalyticsDimensionRowDto[];
  metricMode: "gsc" | "ga4";
  isLoading?: boolean;
  className?: string;
};

function formatNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);
}

function formatPercent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${(value * 100).toFixed(2)}%`;
}

function formatPosition(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toFixed(1);
}

export function AnalyticsDimensionsTable({
  title,
  rows,
  metricMode,
  isLoading,
  className,
}: TAnalyticsDimensionsTableProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.analytics.tables" });

  return (
    <div className={cn("rounded-2xl border border-border bg-bg-card p-4", className)}>
      <p className="type-title mb-3 text-text-primary">{title}</p>
      {isLoading ? (
        <p className="type-caption text-text-muted">{t("loading")}</p>
      ) : rows.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("emptyBody")} />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("dimension")}</TableHead>
                {metricMode === "gsc" ? (
                  <>
                    <TableHead>{t("clicks")}</TableHead>
                    <TableHead>{t("impressions")}</TableHead>
                    <TableHead>{t("ctr")}</TableHead>
                    <TableHead>{t("position")}</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead>{t("sessions")}</TableHead>
                    <TableHead>{t("users")}</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.dimensionValue}>
                  <TableCell className="max-w-[280px] truncate font-medium text-text-primary">
                    {row.dimensionValue}
                  </TableCell>
                  {metricMode === "gsc" ? (
                    <>
                      <TableCell>{formatNumber(row.clicks)}</TableCell>
                      <TableCell>{formatNumber(row.impressions)}</TableCell>
                      <TableCell>{formatPercent(row.ctr)}</TableCell>
                      <TableCell>{formatPosition(row.position)}</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{formatNumber(row.sessions)}</TableCell>
                      <TableCell>{formatNumber(row.totalUsers)}</TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
