import { Suspense } from "react";

import { DashboardPageSkeleton } from "@/components/skeletons/dashboard-page-skeleton";
import { ProjectsListSection } from "@/sections/projects-list-section";

export default function ProjectsPage() {
  return (
    <Suspense fallback={<DashboardPageSkeleton variant="cards" />}>
      <ProjectsListSection />
    </Suspense>
  );
}
