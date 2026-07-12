"use client";

import { IoChevronBack, IoChevronForward } from "react-icons/io5";

import { Button } from "@/components/ui/button";
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
        "flex flex-col gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6",
        className,
      )}
    >
      <p className="type-caption text-text-muted tabular-nums">{summaryLabel}</p>

      <div className="flex items-center justify-end gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="border-border bg-bg-input text-text-secondary hover:bg-bg-hover hover:text-text-primary"
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
                "min-w-8",
                isActive
                  ? "bg-brand text-text-on-brand hover:brightness-105"
                  : "border-border bg-bg-input text-text-secondary hover:bg-bg-hover hover:text-text-primary",
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
          className="border-border bg-bg-input text-text-secondary hover:bg-bg-hover hover:text-text-primary"
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
