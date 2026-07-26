import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type TTableSkeletonProps = {
  rows?: number;
  columns?: number;
  className?: string;
  /** Show table chrome (bordered card). Default true. */
  withChrome?: boolean;
};

export function TableSkeleton({
  rows = 6,
  columns = 4,
  className,
  withChrome = true,
}: TTableSkeletonProps) {
  const body = (
    <div className="w-full" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading</span>
      <div className="flex items-center gap-3 border-b border-border bg-bg-input px-3 py-2.5 sm:px-4">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton
            key={`head-${index}`}
            className={cn(
              "h-2.5 w-16",
              index === 0 && "w-14",
              index === columns - 1 && "ms-auto w-12",
            )}
          />
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={`cell-${rowIndex}-${colIndex}`}
                className={cn(
                  "h-3.5 rounded-md",
                  colIndex === 0 && "w-20",
                  colIndex === 1 && "min-w-0 flex-1",
                  colIndex > 1 && colIndex < columns - 1 && "w-16",
                  colIndex === columns - 1 && "ms-auto w-14",
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  if (!withChrome) return body;

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-bg-card", className)}>
      {body}
    </div>
  );
}
