"use client";

import { DashboardModuleBreadcrumbSection } from "@/components/layout/dashboard-module-breadcrumb-section";

type PlaceholderPageProps = {
  title: string;
};

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <>
      <DashboardModuleBreadcrumbSection items={[{ id: "page", label: title }]} />
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-[var(--text-muted)]">{title} — migration pending</p>
      </div>
    </>
  );
}
