import { Suspense } from "react";

import { DashboardPageSkeleton } from "@/components/skeletons/dashboard-page-skeleton";
import { RolesListSection } from "@/sections/roles-list-section";

export default function RolesPage() {
  return (
    <Suspense fallback={<DashboardPageSkeleton variant="list" />}>
      <RolesListSection />
    </Suspense>
  );
}
