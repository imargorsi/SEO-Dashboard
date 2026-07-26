import { Suspense } from "react";

import { DashboardPageSkeleton } from "@/components/skeletons/dashboard-page-skeleton";
import { UsersListSection } from "@/sections/users-list-section";

export default function UsersPage() {
  return (
    <Suspense fallback={<DashboardPageSkeleton variant="list" />}>
      <UsersListSection />
    </Suspense>
  );
}
