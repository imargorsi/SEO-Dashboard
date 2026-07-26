"use client";

import { IoChevronBack, IoChevronForward } from "react-icons/io5";

import { Button } from "@/components/ui/button";
import { tableRowIconActionClass } from "@/components/table/table-row-icon-actions";
import { getPaginationRange, getVisiblePages } from "@/lib/frontend/table/pagination.utils";
import { cn } from "@/lib/utils";

export type TAppTablePaginationProps = {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  summaryLabel: string;
  previousPageLabel: string;
  nextPageLabel: string;
  pageNumberLabel: (page: number) => string;
  className?: string;
};

export function AppTablePagination({
  page,
  perPage,
  total,
  onPageChange,
  summaryLabel,
  previousPageLabel,
  nextPageLabel,
  pageNumberLabel,
  className,
}: TAppTablePaginationProps) {
  const { lastPage, safePage } = getPaginationRange(page, perPage, total);
  const visiblePages = getVisiblePages(safePage, lastPage);

  return (
    <div
      className={cn(
        "flex flex-col gap-2 border-t border-border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4",
        className,
      )}
    >
      <p className="type-caption text-text-muted tabular-nums">{summaryLabel}</p>

      <div className="flex items-center justify-end gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className={tableRowIconActionClass}
          aria-label={previousPageLabel}
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
        >
          <IoChevronBack className="size-4" aria-hidden />
        </Button>

        {visiblePages.map((pageNumber) => {
          const isActive = pageNumber === safePage;

          return (
            <Button
              key={pageNumber}
              type="button"
              variant={isActive ? "primary" : "outline"}
              size="icon-sm"
              className={cn(
                "min-w-7",
                isActive
                  ? "bg-brand text-text-on-brand hover:brightness-105"
                  : tableRowIconActionClass,
              )}
              aria-label={pageNumberLabel(pageNumber)}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </Button>
          );
        })}

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className={tableRowIconActionClass}
          aria-label={nextPageLabel}
          disabled={safePage >= lastPage}
          onClick={() => onPageChange(safePage + 1)}
        >
          <IoChevronForward className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
