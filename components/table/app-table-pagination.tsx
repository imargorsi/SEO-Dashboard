"use client";

import { Button } from "@/components/ui/button";
import { Icons } from "@/lib/frontend/icons/app-icons";
import {
  tablePaginationBarClass,
  tablePaginationIconActionClass,
} from "@/lib/frontend/layout/dashboard-chrome";
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
    <div className={cn(tablePaginationBarClass, className)}>
      <p className="type-caption text-text-muted tabular-nums">{summaryLabel}</p>

      <div className="flex items-center justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={tablePaginationIconActionClass}
          aria-label={previousPageLabel}
          title={previousPageLabel}
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
        >
          <Icons.arrowLeft className="size-3.5" aria-hidden />
        </Button>

        {visiblePages.map((pageNumber) => {
          const isActive = pageNumber === safePage;

          return (
            <Button
              key={pageNumber}
              type="button"
              variant="ghost"
              size="icon-sm"
              className={cn(
                tablePaginationIconActionClass,
                isActive &&
                  "border-transparent bg-brand text-text-on-brand hover:border-transparent hover:bg-brand hover:text-text-on-brand hover:brightness-105",
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
          variant="ghost"
          size="icon-sm"
          className={tablePaginationIconActionClass}
          aria-label={nextPageLabel}
          title={nextPageLabel}
          disabled={safePage >= lastPage}
          onClick={() => onPageChange(safePage + 1)}
        >
          <Icons.arrowRight className="size-3.5" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
