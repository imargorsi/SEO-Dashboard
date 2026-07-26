"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { AppTablePagination, type TAppTablePaginationProps } from "@/components/table/app-table-pagination";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { IoSearchOutline } from "react-icons/io5";

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
  emptyTitle,
  emptyBody,
  noDataComponent,
  pagination,
  className,
}: TAppTableProps<T>) {
  const { t } = useTranslation("translation", { keyPrefix: "table" });
  const resolvedEmptyTitle = emptyTitle ?? t("emptyTitle");
  const resolvedEmptyBody = emptyBody ?? t("emptyBody");
  const columnCount = columns.length;
  const showInitialLoading = isLoading && data.length === 0;
  const showEmptyState = !showInitialLoading && data.length === 0;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-bg-card transition-opacity duration-200",
        isFetching && data.length > 0 && "opacity-70",
        className,
      )}
    >
      {showInitialLoading ? (
        <TableSkeleton rows={6} columns={columnCount} withChrome={false} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-bg-input hover:bg-bg-input">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    "h-9 px-3 type-overline text-text-muted sm:px-4",
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
            {showEmptyState ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columnCount} className="p-3 sm:p-4">
                  {noDataComponent ?? (
                    <EmptyState
                      title={resolvedEmptyTitle}
                      description={resolvedEmptyBody ?? ""}
                      icon={IoSearchOutline}
                      className="py-6 sm:py-8"
                    />
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
                        "px-3 py-2.5 type-body sm:px-4",
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
      )}

      {pagination && !showInitialLoading ? <AppTablePagination {...pagination} /> : null}
    </div>
  );
}
