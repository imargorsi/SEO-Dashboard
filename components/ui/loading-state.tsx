import {
  DashboardPageSkeleton,
  type TDashboardPageSkeletonProps,
} from "@/components/skeletons/dashboard-page-skeleton";

type LoadingStateProps = {
  className?: string;
  skeletonVariant?: TDashboardPageSkeletonProps["variant"];
  embedded?: boolean;
};

/** Thin alias for page-level skeleton loading. Prefer specific skeletons when the layout is known. */
export function LoadingState({
  className,
  skeletonVariant = "list",
  embedded = false,
}: LoadingStateProps) {
  return (
    <DashboardPageSkeleton
      variant={skeletonVariant}
      className={className}
      embedded={embedded}
    />
  );
}
