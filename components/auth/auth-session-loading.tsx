"use client";

import { DashboardPageSkeleton } from "@/components/skeletons/dashboard-page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthSessionLoading() {
  return (
    <div className="flex min-h-svh flex-1 flex-col bg-bg-main">
      <div className="flex flex-1">
        <aside className="hidden w-60 shrink-0 border-e border-border bg-bg-sidebar p-4 md:block" aria-hidden>
          <div className="mb-8 flex justify-center">
            <Skeleton className="size-10 rounded-xl" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-xl" />
            ))}
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <DashboardPageSkeleton variant="list" />
        </div>
      </div>
    </div>
  );
}
