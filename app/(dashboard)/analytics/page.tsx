import { Suspense } from "react";

import { DashboardPageSkeleton } from "@/components/skeletons/dashboard-page-skeleton";
import { AnalyticsSection } from "@/sections/analytics-section";

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<DashboardPageSkeleton variant="list" />}>
      <AnalyticsSection />
    </Suspense>
  );
}
