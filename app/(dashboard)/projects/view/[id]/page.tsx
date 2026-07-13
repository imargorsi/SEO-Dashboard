import { Suspense } from "react";

import { ProjectDetailPageFallback } from "@/components/projects/detail/project-detail-page-fallback";
import { ProjectDetailSection } from "@/sections/project-detail-section";

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={<ProjectDetailPageFallback />}>
      <ProjectDetailSection />
    </Suspense>
  );
}
