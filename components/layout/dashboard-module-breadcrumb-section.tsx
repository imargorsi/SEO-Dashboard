"use client";

import { useEffect } from "react";

import {
  breadcrumbKey,
  type DashboardBreadcrumbItem,
  useDashboardBreadcrumbs,
} from "@/context/dashboard-breadcrumb-context";

export type DashboardBreadcrumbSegment = DashboardBreadcrumbItem;


export function DashboardModuleBreadcrumbSection({ items }: { items: DashboardBreadcrumbSegment[] }) {
  const { setBreadcrumbOverride } = useDashboardBreadcrumbs();
  const key = breadcrumbKey(items);

  useEffect(() => {
    setBreadcrumbOverride(items);
    return () => setBreadcrumbOverride(null);
  }, [key, setBreadcrumbOverride, items]);

  return null;
}
