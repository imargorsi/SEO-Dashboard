"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { AnalyticsDimensionsTable } from "@/components/analytics/analytics-dimensions-table";
import { AnalyticsSummaryCards } from "@/components/analytics/analytics-summary-cards";
import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSelectedProject } from "@/context/selected-project-context";
import { useProjectAccess } from "@/context/project-access-context";
import {
  useAnalyticsDimensionsQuery,
  useAnalyticsOverviewQuery,
} from "@/features/analytics/analytics.api";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { notify } from "@/lib/frontend/feedback/notify";
import { defaultAnalyticsDateRange } from "@/lib/integrations/date.utils";
import { hasPermission, mergePermissions } from "@/lib/rbac/access";

export function AnalyticsSection() {
  const { t } = useTranslation("translation", { keyPrefix: "modules.analytics" });
  const { selectedProject } = useSelectedProject();
  const projectId = selectedProject?.id ?? null;
  const { data: authUser } = useAuthUserQuery();
  const { projectPermissions } = useProjectAccess();
  const loadErrorNotified = useRef(false);

  const defaultRange = useMemo(() => defaultAnalyticsDateRange(), []);
  const [from, setFrom] = useState(defaultRange.from);
  const [to, setTo] = useState(defaultRange.to);

  const permissions = useMemo(
    () => mergePermissions(authUser?.permissions ?? [], projectPermissions),
    [authUser?.permissions, projectPermissions],
  );
  const canView = hasPermission(permissions, "analytics.view");

  const overviewQuery = useAnalyticsOverviewQuery(
    projectId,
    { from, to },
    { enabled: Boolean(projectId) && canView },
  );

  const queriesQuery = useAnalyticsDimensionsQuery(
    projectId,
    { from, to, source: "gsc", dimensionType: "query", limit: 25 },
    { enabled: Boolean(projectId) && canView },
  );
  const pagesQuery = useAnalyticsDimensionsQuery(
    projectId,
    { from, to, source: "gsc", dimensionType: "page", limit: 25 },
    { enabled: Boolean(projectId) && canView },
  );
  const geoQuery = useAnalyticsDimensionsQuery(
    projectId,
    { from, to, source: "ga4", dimensionType: "country", limit: 25 },
    { enabled: Boolean(projectId) && canView },
  );

  useEffect(() => {
    const error =
      overviewQuery.error || queriesQuery.error || pagesQuery.error || geoQuery.error;
    if (!error || loadErrorNotified.current) return;
    loadErrorNotified.current = true;
    notify.error(error instanceof Error ? error.message : t("loadError"));
  }, [geoQuery.error, overviewQuery.error, pagesQuery.error, queriesQuery.error, t]);

  if (!projectId) {
    return (
      <div className="w-full min-w-0 px-4 py-4 sm:px-5 sm:py-5">
        <EmptyState title={t("selectProjectTitle")} description={t("selectProjectBody")} />
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="w-full min-w-0 px-4 py-4 sm:px-5 sm:py-5">
        <EmptyState title={t("noAccessTitle")} description={t("noAccessBody")} />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <Heading id="analytics-title" pageTitle>
              {t("title")}
            </Heading>
            <Paragraph className="text-text-muted">{t("subtitle")}</Paragraph>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="analytics-from">{t("dateFrom")}</Label>
              <Input
                id="analytics-from"
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                className="w-[160px]"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="analytics-to">{t("dateTo")}</Label>
              <Input
                id="analytics-to"
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                className="w-[160px]"
              />
            </div>
          </div>
        </div>

        <AnalyticsSummaryCards
          overview={overviewQuery.data}
          isLoading={overviewQuery.isLoading}
        />

        <div className="grid gap-4 xl:grid-cols-2">
          <AnalyticsDimensionsTable
            title={t("tables.topQueries")}
            rows={queriesQuery.data?.rows ?? []}
            metricMode="gsc"
            isLoading={queriesQuery.isLoading}
          />
          <AnalyticsDimensionsTable
            title={t("tables.topPages")}
            rows={pagesQuery.data?.rows ?? []}
            metricMode="gsc"
            isLoading={pagesQuery.isLoading}
          />
        </div>

        <AnalyticsDimensionsTable
          title={t("tables.geoTraffic")}
          rows={geoQuery.data?.rows ?? []}
          metricMode="ga4"
          isLoading={geoQuery.isLoading}
        />
      </div>
    </div>
  );
}
