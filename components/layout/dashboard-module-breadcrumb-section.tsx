"use client";

import { useEffect, useRef, type ReactNode } from "react";

import {
  breadcrumbKey,
  type DashboardBreadcrumbItem,
  useDashboardBreadcrumbs,
} from "@/context/dashboard-breadcrumb-context";

export type DashboardBreadcrumbSegment = DashboardBreadcrumbItem;

function useSetDashboardBreadcrumbs(items: DashboardBreadcrumbSegment[]) {
  const { setBreadcrumbs } = useDashboardBreadcrumbs();
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const key = breadcrumbKey(items);

  useEffect(() => {
    setBreadcrumbs(itemsRef.current);
    return () => setBreadcrumbs([]);
  }, [key, setBreadcrumbs]);
}

/** Registers page breadcrumbs for the shell top bar. Renders nothing. */
export function DashboardModuleBreadcrumbSection({ items }: { items: DashboardBreadcrumbSegment[] }) {
  useSetDashboardBreadcrumbs(items);
  return null;
}
