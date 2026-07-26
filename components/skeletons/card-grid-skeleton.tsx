import { Skeleton } from "@/components/ui/skeleton";
import { elevatedCardSurfaceClass } from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

type TCardGridSkeletonProps = {
  count?: number;
  className?: string;
};

export function CardGridSkeleton({ count = 6, className }: TCardGridSkeletonProps) {
  return (
    <div
      className={cn("grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading</span>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={cn(elevatedCardSurfaceClass, "rounded-3xl p-5 sm:p-6")}>
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="size-12 rounded-xl" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-6 w-48 max-w-full" />
            <Skeleton className="h-4 w-full max-w-56" />
          </div>
          <div className="mt-6 space-y-2.5">
            <Skeleton className="h-3 w-24" />
            <div className="flex items-center gap-2">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <Skeleton className="h-9 flex-1 rounded-xl" />
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
