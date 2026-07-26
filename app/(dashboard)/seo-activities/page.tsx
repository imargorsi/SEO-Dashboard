import { Suspense } from "react";

import { DashboardPageSkeleton } from "@/components/skeletons/dashboard-page-skeleton";
import { SeoActivitiesSection } from "@/sections/seo-activities-section";

export default function SeoActivitiesPage() {
  return (
    <Suspense fallback={<DashboardPageSkeleton variant="list" />}>
      <SeoActivitiesSection />
    </Suspense>
  );
}
