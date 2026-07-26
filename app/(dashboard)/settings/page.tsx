import { Suspense } from "react";

import { DashboardPageSkeleton } from "@/components/skeletons/dashboard-page-skeleton";
import { SettingsSection } from "@/sections/settings-section";

export default function SettingsPage() {
  return (
    <Suspense fallback={<DashboardPageSkeleton variant="settings" />}>
      <SettingsSection />
    </Suspense>
  );
}
