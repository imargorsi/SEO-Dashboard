import { CardGridSkeleton } from "@/components/skeletons/card-grid-skeleton";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { elevatedCardSurfaceClass } from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

export type TDashboardPageSkeletonProps = {
  /** list = header + filters + table; cards = header + card grid; form = header + form card; detail = detail layout */
  variant?: "list" | "cards" | "form" | "detail" | "settings";
  className?: string;
  /** Skip page padding when the parent already provides it. */
  embedded?: boolean;
};

function PageHeaderSkeleton({ withAction = true }: { withAction?: boolean }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 sm:w-56" />
        <Skeleton className="h-4 w-64 max-w-full sm:w-80" />
      </div>
      {withAction ? <Skeleton className="h-10 w-36 rounded-xl" /> : null}
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
      <Skeleton className="h-10 w-full rounded-xl sm:w-56" />
      <Skeleton className="h-10 w-28 rounded-xl" />
      <Skeleton className="h-10 w-44 rounded-2xl" />
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className={cn(elevatedCardSurfaceClass, "space-y-6 rounded-3xl p-5 sm:p-6")}>
      <div className="grid gap-5 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Skeleton className="h-10 w-24 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-4 w-64 max-w-full" />
      <div className={cn(elevatedCardSurfaceClass, "rounded-3xl p-5 sm:p-6")}>
        <div className="flex flex-wrap items-start gap-4">
          <Skeleton className="size-16 rounded-2xl" />
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-7 w-56 max-w-full" />
            <Skeleton className="h-4 w-40" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className={cn(elevatedCardSurfaceClass, "space-y-4 rounded-3xl p-5 sm:p-6")}>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
        <div className={cn(elevatedCardSurfaceClass, "space-y-4 rounded-3xl p-5 sm:p-6")}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[14rem_minmax(0,1fr)]">
      <div className={cn(elevatedCardSurfaceClass, "space-y-2 rounded-3xl p-3")}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full rounded-xl" />
        ))}
      </div>
      <div className={cn(elevatedCardSurfaceClass, "space-y-4 rounded-3xl p-5 sm:p-6")}>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-full max-w-md" />
        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function DashboardPageSkeleton({
  variant = "list",
  className,
  embedded = false,
}: TDashboardPageSkeletonProps) {
  const content = (
    <>
      {variant === "detail" ? null : <PageHeaderSkeleton withAction={variant !== "settings"} />}

      {variant === "list" ? (
        <div className="flex flex-col gap-4">
          <FiltersSkeleton />
          <TableSkeleton />
        </div>
      ) : null}

      {variant === "cards" ? <CardGridSkeleton /> : null}
      {variant === "form" ? <FormSkeleton /> : null}
      {variant === "detail" ? <DetailSkeleton /> : null}
      {variant === "settings" ? <SettingsSkeleton /> : null}
    </>
  );

  return (
    <div
      className={cn("w-full min-w-0", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading</span>
      {embedded ? (
        <div className="space-y-5">{content}</div>
      ) : (
        <div className="space-y-5 px-4 py-6 sm:px-6">{content}</div>
      )}
    </div>
  );
}

export function SheetContentSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-5 p-1", className)} role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading</span>
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56 max-w-full" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 pt-2">
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-7 w-16 rounded-full" />
      </div>
    </div>
  );
}
