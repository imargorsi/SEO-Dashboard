"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import type { TAppIconComponent } from "@/components/ui/app-icon";
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
import { Icons } from "@/lib/frontend/icons/app-icons";
import {
  tableBodyCellClass,
  tableBodyRowClass,
  tableHeaderCellClass,
  tableHeaderRowClass,
  tableShellClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

export type TAppTableColumn<T> = {
  key: string;
  label: ReactNode;
  /** Optional icon shown before the header label. */
  headerIcon?: TAppIconComponent;
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
  /** Opens detail / navigates when the row body is clicked (ignores buttons, links, inputs). */
  onRowClick?: (item: T, index: number) => void;
  /** Accessible name for clickable rows (e.g. "View Jane"). */
  getRowClickLabel?: (item: T, index: number) => string;
  className?: string;
};

function isInteractiveRowTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      "button, a, input, select, textarea, [role='button'], [role='switch'], [role='menuitem'], [data-row-click-ignore]",
    ),
  );
}

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

function TableColumnHeader({
  label,
  Icon,
  align,
}: {
  label: ReactNode;
  Icon?: TAppIconComponent;
  align?: TAppTableColumn<unknown>["align"];
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        align === "end" && "justify-end",
        align === "center" && "justify-center",
      )}
    >
      {Icon ? <Icon className="size-4 shrink-0 text-text-muted" aria-hidden /> : null}
      <span>{label}</span>
    </span>
  );
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
  onRowClick,
  getRowClickLabel,
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
        tableShellClass,
        isFetching && data.length > 0 && "opacity-70",
        className,
      )}
    >
      {showInitialLoading ? (
        <TableSkeleton rows={6} columns={columnCount} withChrome={false} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className={tableHeaderRowClass}>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    tableHeaderCellClass,
                    getAlignClassName(column.align),
                    column.headerClassName,
                  )}
                >
                  <TableColumnHeader
                    label={column.label}
                    Icon={column.headerIcon}
                    align={column.align}
                  />
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
                      icon={Icons.search}
                      className="py-6 sm:py-8"
                    />
                  )}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow
                  key={String(getRowId(item, index))}
                  className={cn(tableBodyRowClass, onRowClick && "cursor-pointer")}
                  role={onRowClick ? "button" : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  aria-label={onRowClick && getRowClickLabel ? getRowClickLabel(item, index) : undefined}
                  onClick={
                    onRowClick
                      ? (event) => {
                          if (isInteractiveRowTarget(event.target)) return;
                          onRowClick(item, index);
                        }
                      : undefined
                  }
                  onKeyDown={
                    onRowClick
                      ? (event) => {
                          if (event.key !== "Enter" && event.key !== " ") return;
                          if (isInteractiveRowTarget(event.target)) return;
                          event.preventDefault();
                          onRowClick(item, index);
                        }
                      : undefined
                  }
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={cn(
                        tableBodyCellClass,
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
