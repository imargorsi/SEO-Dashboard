"use client";

import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { SeoActivitiesTable } from "@/components/seo-activities/seo-activities-table";
import { SeoActivityTypeFilter } from "@/components/seo-activities/seo-activity-type-filter";
import { LoadingState } from "@/components/ui/loading-state";
import { StateCard } from "@/components/ui/state-card";
import { useSelectedProject } from "@/context/selected-project-context";
import { useSeoActivitiesQuery } from "@/features/seo-activities/seo-activities.api";
import { useQueryParams } from "@/hooks/use-query-params.hook";
import { ApiError } from "@/lib/frontend/api/errors";
import { parseSeoActivitiesListQuery } from "@/lib/frontend/seo-activities/list-query.utils";
import type { TSeoActivityType } from "@/types/seo-activity.types";
import type {
  TSeoActivityBacklink,
  TSeoActivityBlog,
  TSeoActivityWebChange,
} from "@/types/seo-activity.types";

export function SeoActivitiesSection() {
  const { t } = useTranslation("translation", { keyPrefix: "modules.seoActivities" });
  const { queryParams, updateQueryParams, deleteQueryParams } = useQueryParams();
  const listQuery = parseSeoActivitiesListQuery(queryParams);
  const { selectedProject } = useSelectedProject();
  const projectId = selectedProject?.id ?? null;

  const { data, isPending, isFetching, isError, error } = useSeoActivitiesQuery(
    projectId,
    listQuery.type,
    listQuery.page,
    { enabled: Boolean(projectId) },
  );

  const counts = data?.counts ?? { blogs: 0, backlinks: 0, web_changes: 0 };
  const rows = data?.items ?? [];
  const total = data?.pagination.total ?? 0;
  const page = data?.pagination.current_page ?? listQuery.page;

  const onTypeChange = useCallback(
    (type: TSeoActivityType) => {
      if (type === "blogs") {
        deleteQueryParams(["type", "page"]);
        return;
      }
      updateQueryParams({ type }, ["page"]);
    },
    [deleteQueryParams, updateQueryParams],
  );

  const onPageChange = useCallback(
    (nextPage: number) => {
      if (nextPage <= 1) {
        deleteQueryParams(["page"]);
        return;
      }
      updateQueryParams({ page: nextPage });
    },
    [deleteQueryParams, updateQueryParams],
  );

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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <Heading id="seo-activities-title" pageTitle>
              {t(`typeFilter.${listQuery.type}`)}
            </Heading>
            <Paragraph className="text-text-muted">{t("subtitle")}</Paragraph>
          </div>
          <SeoActivityTypeFilter
            activeType={listQuery.type}
            counts={counts}
            onTypeChange={onTypeChange}
            className="shrink-0 self-start"
          />
        </div>

        {isPending ? (
          <LoadingState />
        ) : isError ? (
          <StateCard
            title={t("table.emptyTitle")}
            body={ApiError.messageFrom(error, t("table.emptyBody"))}
          />
        ) : (
          <SeoActivitiesTable
            type={listQuery.type}
            rows={
              rows as TSeoActivityBlog[] | TSeoActivityBacklink[] | TSeoActivityWebChange[]
            }
            page={page}
            perPage={listQuery.perPage}
            total={total}
            onPageChange={onPageChange}
            className={isFetching ? "opacity-80" : undefined}
          />
        )}
      </div>
    </div>
  );
}
