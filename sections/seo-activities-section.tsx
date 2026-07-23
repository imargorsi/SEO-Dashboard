"use client";

import { useTranslation } from "react-i18next";

import { SeoActivitiesTable } from "@/components/seo-activities/seo-activities-table";
import { SeoActivityDateRangeFilter } from "@/components/seo-activities/seo-activity-date-range-filter";
import { SeoActivitySummaryCards } from "@/components/seo-activities/seo-activity-summary-cards";
import { SeoActivityTypeFilter } from "@/components/seo-activities/seo-activity-type-filter";
import { Heading } from "@/components/heading";
import { StateCard } from "@/components/ui/state-card";
import { useSelectedProject } from "@/context/selected-project-context";
import { useQueryParams } from "@/hooks/use-query-params.hook";
import { getDummySeoActivitiesByType } from "@/lib/frontend/seo-activities/dummy-data";
import { isDateInRange, type TDateRange } from "@/lib/frontend/seo-activities/date-range.utils";
import {
  paginateItems,
  parseSeoActivitiesListQuery,
} from "@/lib/frontend/seo-activities/list-query.utils";
import { buildSeoActivityRangeStats } from "@/lib/frontend/seo-activities/summary.utils";
import type {
  TSeoActivityBacklink,
  TSeoActivityBlog,
  TSeoActivityType,
  TSeoActivityWebChange,
} from "@/types/seo-activity.types";

export function SeoActivitiesSection() {
  const { t } = useTranslation("translation", { keyPrefix: "modules.seoActivities" });
  const { queryParams, updateQueryParams, deleteQueryParams } = useQueryParams();
  const listQuery = parseSeoActivitiesListQuery(queryParams);
  const { selectedProject } = useSelectedProject();
  const projectId = selectedProject?.id ?? null;

  const { counts, metrics } = buildSeoActivityRangeStats(listQuery.dateRange);
  const allRows = getDummySeoActivitiesByType(listQuery.type).filter((row) =>
    isDateInRange(row.occurredOn, listQuery.dateRange),
  );
  const rows = paginateItems(allRows, listQuery.page, listQuery.perPage);

  function onTypeChange(type: TSeoActivityType) {
    if (type === "blogs") {
      deleteQueryParams(["type", "page"]);
      return;
    }
    updateQueryParams({ type }, ["page"]);
  }

  function onPageChange(nextPage: number) {
    if (nextPage <= 1) {
      deleteQueryParams(["page"]);
      return;
    }
    updateQueryParams({ page: nextPage });
  }

  function onDateRangeChange(range: TDateRange) {
    if (!range.from && !range.to) {
      updateQueryParams({ range: "all" }, ["from", "to", "page"]);
      return;
    }

    const next: Record<string, string> = {};
    if (range.from) next.from = range.from;
    if (range.to) next.to = range.to;
    updateQueryParams(next, ["page", "range"]);
  }

  if (!projectId) {
    return (
      <div className="w-full min-w-0 px-4 py-6 sm:px-6">
        <StateCard title={t("selectProjectTitle")} body={t("selectProjectBody")} />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <div className="space-y-5 px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Heading id="seo-activities-title" pageTitle>
            {t("title")}
          </Heading>
          <SeoActivityTypeFilter
            activeType={listQuery.type}
            counts={counts}
            onTypeChange={onTypeChange}
            className="shrink-0 self-start sm:self-auto"
          />
        </div>

        <SeoActivitySummaryCards metrics={metrics} />

        <div className="space-y-3">
          <div className="flex justify-end">
            <SeoActivityDateRangeFilter value={listQuery.dateRange} onChange={onDateRangeChange} />
          </div>

          <SeoActivitiesTable
            type={listQuery.type}
            rows={rows as TSeoActivityBlog[] | TSeoActivityBacklink[] | TSeoActivityWebChange[]}
            page={listQuery.page}
            perPage={listQuery.perPage}
            total={allRows.length}
            onPageChange={onPageChange}
          />
        </div>
      </div>
    </div>
  );
}
