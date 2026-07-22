import { Suspense } from "react";

import { LoadingState } from "@/components/ui/loading-state";
import { SeoActivitiesSection } from "@/sections/seo-activities-section";

export default function SeoActivitiesPage() {
  return (
    <Suspense fallback={<LoadingState className="m-6" />}>
      <SeoActivitiesSection />
    </Suspense>
  );
}
