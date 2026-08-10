"use client";

import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";

import { AnalyticsPerformanceTrendChart } from "@/components/analytics/analytics-performance-trend-chart";
import { DashboardAssistantPanel } from "@/components/dashboard/dashboard-assistant-panel";
import { DashboardSeoPulse } from "@/components/dashboard/dashboard-seo-pulse";
import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { EmptyState } from "@/components/ui/empty-state";
import { PageAmbientGlow } from "@/components/ui/page-ambient-glow";
import { useProjectAccess } from "@/context/project-access-context";
import { useSelectedProject } from "@/context/selected-project-context";
import { useAnalyticsOverviewQuery } from "@/features/analytics/analytics.api";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { useLeadsQuery } from "@/features/leads/leads.api";
import { useSeoActivitiesQuery } from "@/features/seo-activities/seo-activities.api";
import { ANALYTICS_MAX_RANGE_DAYS } from "@/lib/integrations/constants";
import { addUtcDays, utcYesterdayString } from "@/lib/integrations/date.utils";
import { ApiError } from "@/lib/frontend/api/errors";
import { notify } from "@/lib/frontend/feedback/notify";
import { typeStackMdClass } from "@/lib/frontend/layout/dashboard-chrome";
import { hasPermission, mergePermissions } from "@/lib/rbac/access";
import { cn } from "@/lib/utils";

/** Widest overview window Analytics API allows (cache is typically ≤90d backfill). */
function allTimeAnalyticsRange(now = new Date()): { from: string; to: string } {
  const to = utcYesterdayString(now);
  return { from: addUtcDays(to, -(ANALYTICS_MAX_RANGE_DAYS - 1)), to };
}

export function DashboardHomeSection() {
  const { t } = useTranslation("translation", { keyPrefix: "home" });
  const { selectedProject } = useSelectedProject();
  const projectId = selectedProject?.id ?? null;
  const { data: authUser } = useAuthUserQuery();
  const { projectPermissions } = useProjectAccess();
  const loadErrorNotified = useRef(false);

  const permissions = useMemo(
    () => mergePermissions(authUser?.permissions ?? [], projectPermissions),
    [authUser?.permissions, projectPermissions],
  );

  const canViewLeads = hasPermission(permissions, "leads.view");
  const canViewAnalytics = hasPermission(permissions, "analytics.view");
  const canViewSeo = hasPermission(permissions, "seo_activities.view");

  const analyticsRange = useMemo(() => allTimeAnalyticsRange(), []);
  const analyticsEnabled = Boolean(projectId) && canViewAnalytics;

  const leadsQuery = useLeadsQuery(
    projectId,
    { page: 1, per_page: 1 },
    { enabled: Boolean(projectId) && canViewLeads },
  );

  const seoQuery = useSeoActivitiesQuery(
    projectId,
    { type: "blogs", page: 1, per_page: 1 },
    { enabled: Boolean(projectId) && canViewSeo },
  );

  const overviewQuery = useAnalyticsOverviewQuery(projectId, analyticsRange, {
    enabled: analyticsEnabled,
  });

  useEffect(() => {
    if (loadErrorNotified.current) return;
    const error = leadsQuery.error ?? seoQuery.error ?? overviewQuery.error;
    if (!error) return;
    loadErrorNotified.current = true;
    notify.error(ApiError.messageFrom(error, t("loadError")));
  }, [leadsQuery.error, overviewQuery.error, seoQuery.error, t]);

  if (!projectId) {
    return (
      <div className="flex h-full min-h-0 w-full min-w-0 items-center justify-center px-4 py-6 sm:px-6">
        <EmptyState title={t("selectProjectTitle")} description={t("selectProjectBody")} />
      </div>
    );
  }

  const pulseLoading =
    (canViewLeads && leadsQuery.isLoading) ||
    (canViewSeo && seoQuery.isLoading) ||
    (canViewAnalytics && overviewQuery.isLoading);

  const typeCounts = seoQuery.data?.filters.type_counts;

  return (
    <div className="relative flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden max-xl:h-auto max-xl:overflow-y-auto">
      <PageAmbientGlow />

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-3 max-xl:h-auto max-xl:overflow-y-auto sm:px-6 sm:py-4">
        <div className={cn(typeStackMdClass, "shrink-0")}>
          <Heading id="dashboard-home-title" pageTitle>
            {t("title")}
          </Heading>
          <Paragraph className="text-text-secondary">{t("subtitle")}</Paragraph>
        </div>

        <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 xl:gap-4">
          <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] xl:items-stretch xl:gap-4">
            <div className="min-h-0 min-w-0 xl:h-full">
              <DashboardAssistantPanel
                projectId={projectId}
                canViewLeads={canViewLeads}
                canViewAnalytics={canViewAnalytics}
                compact
                className="h-full min-h-0"
              />
            </div>

            <section aria-label={t("pulse.title")} className="min-h-0 min-w-0 xl:h-full">
              <DashboardSeoPulse
                compact
                className="h-full min-h-0"
                isLoading={pulseLoading}
                values={{
                  leads: canViewLeads ? (leadsQuery.data?.filters.counts.total ?? 0) : null,
                  backlinks: canViewSeo ? (typeCounts?.backlinks ?? 0) : null,
                  clicks: canViewAnalytics
                    ? (overviewQuery.data?.cards.clicks.value ?? 0)
                    : null,
                  blogs: canViewSeo ? (typeCounts?.blogs ?? 0) : null,
                }}
              />
            </section>
          </div>

          {canViewAnalytics ? (
            <div className="min-h-0 flex-1">
              <AnalyticsPerformanceTrendChart
                compact
                fill
                overview={overviewQuery.data}
                isLoading={overviewQuery.isLoading}
                className="h-full"
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
