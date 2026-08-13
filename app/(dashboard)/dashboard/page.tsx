import { Suspense } from "react";

import { DashboardPageSkeleton } from "@/components/skeletons/dashboard-page-skeleton";
import { DashboardHomeSection } from "@/sections/dashboard-home-section";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardPageSkeleton variant="list" />}>
      <DashboardHomeSection />
    </Suspense>
  );
}
