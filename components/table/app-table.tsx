"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { AppTablePagination, type TAppTablePaginationProps } from "@/components/table/app-table-pagination";
import { LoadingState } from "@/components/ui/loading-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type TAppTableColumn<T> = {
  key: string;
  label: ReactNode;
  render?: (item: T, index: number) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  align?: "start" | "center" | "end";
};

export type TAppTableProps<T> = {
  columns: TAppTableColumn<T>[];
  data: T[];
  getRowId: (item: T, index: number) => string | number;
  isLoading?: boolean;
  isFetching?: boolean;
  loadingLabel?: string;
  updatingLabel?: string;
  emptyTitle?: string;
  emptyBody?: string;
  noDataComponent?: ReactNode;
  pagination?: Omit<TAppTablePaginationProps, "className">;
  className?: string;
};

function getAlignClassName(align: TAppTableColumn<unknown>["align"]) {
  if (align === "end") return "text-end";
  if (align === "center") return "text-center";
  return "text-start";
}

function getCellContent<T extends Record<string, unknown>>(
  item: T,
  column: TAppTableColumn<T>,
  index: number,
): ReactNode {
  if (column.render) return column.render(item, index);

  const value = item[column.key];
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return String(value);
}

export function AppTable<T extends Record<string, unknown>>({
  columns,
  data,
  getRowId,
  isLoading = false,
  isFetching = false,
  loadingLabel,
  updatingLabel,
  emptyTitle,
  emptyBody,
  noDataComponent,
  pagination,
  className,
}: TAppTableProps<T>) {
  const { t } = useTranslation("translation", { keyPrefix: "table" });
  const resolvedLoadingLabel = loadingLabel ?? t("loading");
  const resolvedEmptyTitle = emptyTitle ?? t("emptyTitle");
  const resolvedEmptyBody = emptyBody ?? t("emptyBody");
  const columnCount = columns.length;
  const showInitialLoading = isLoading && data.length === 0;
  const showEmptyState = !showInitialLoading && data.length === 0;

  return (
    <div className={cn("overflow-hidden rounded-3xl border border-border bg-bg-card", className)}>
      <Table>
        <TableHeader>
          <TableRow className="border-border bg-bg-input hover:bg-bg-input">
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  "h-12 px-4 type-overline text-text-muted sm:px-6",
                  getAlignClassName(column.align),
                  column.headerClassName,
                )}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {showInitialLoading ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columnCount} className="px-4 py-12 sm:px-6">
                <LoadingState label={resolvedLoadingLabel} />
              </TableCell>
            </TableRow>
          ) : showEmptyState ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columnCount} className="px-4 py-12 sm:px-6">
                {noDataComponent ?? (
                  <div className="text-center">
                    <p className="type-body-strong text-text-primary">{resolvedEmptyTitle}</p>
                    {resolvedEmptyBody ? <p className="mt-1 type-caption text-text-muted">{resolvedEmptyBody}</p> : null}
                  </div>
                )}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow key={String(getRowId(item, index))} className="border-border hover:bg-bg-hover">
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn(
                      "px-4 py-4 sm:px-6",
                      getAlignClassName(column.align),
                      column.cellClassName,
                    )}
                  >
                    {getCellContent(item, column, index)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {isFetching && data.length > 0 && updatingLabel ? (
        <p className="border-t border-border px-4 py-2 type-caption text-text-muted sm:px-6">{updatingLabel}</p>
      ) : null}

      {pagination ? <AppTablePagination {...pagination} /> : null}
    </div>
  );
}
