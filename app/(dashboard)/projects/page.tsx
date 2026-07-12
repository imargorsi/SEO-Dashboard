import { Suspense } from "react";

import { LoadingState } from "@/components/ui/loading-state";
import { ProjectsListSection } from "@/sections/projects-list-section";

export default function ProjectsPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading…" />}>
      <ProjectsListSection />
    </Suspense>
  );
}
