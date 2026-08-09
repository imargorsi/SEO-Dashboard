import { Suspense } from "react";

import { DashboardPageSkeleton } from "@/components/skeletons/dashboard-page-skeleton";
import { LeadsSection } from "@/sections/leads-section";

export default function LeadsPage() {
  return (
    <Suspense fallback={<DashboardPageSkeleton variant="list" />}>
      <LeadsSection />
    </Suspense>
  );
}
