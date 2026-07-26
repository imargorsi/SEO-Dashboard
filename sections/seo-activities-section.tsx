"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoAdd } from "react-icons/io5";

import { SeoActivitiesTable } from "@/components/seo-activities/seo-activities-table";
import { SeoActivityDateRangeFilter } from "@/components/seo-activities/seo-activity-date-range-filter";
import { SeoActivityQuickAdd } from "@/components/seo-activities/seo-activity-quick-add";
import { SeoActivitySummaryCards } from "@/components/seo-activities/seo-activity-summary-cards";
import { SeoActivityTypeFilter } from "@/components/seo-activities/seo-activity-type-filter";
import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { useQueryParams } from "@/hooks/use-query-params.hook";
import {
  DUMMY_SEO_ACTIVITY_BACKLINKS,
  DUMMY_SEO_ACTIVITY_BLOGS,
  DUMMY_SEO_ACTIVITY_WEB_CHANGES,
} from "@/lib/frontend/seo-activities/dummy-data";
import { isDateInRange, type TDateRange } from "@/lib/frontend/seo-activities/date-range.utils";
import {
  paginateItems,
  parseSeoActivitiesListQuery,
} from "@/lib/frontend/seo-activities/list-query.utils";
import { notify } from "@/lib/frontend/feedback/notify";
import type { TSeoActivityCollections } from "@/lib/frontend/seo-activities/quick-add.utils";
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
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [collections, setCollections] = useState<TSeoActivityCollections>(() => ({
    blogs: [...DUMMY_SEO_ACTIVITY_BLOGS],
    backlinks: [...DUMMY_SEO_ACTIVITY_BACKLINKS],
    web_changes: [...DUMMY_SEO_ACTIVITY_WEB_CHANGES],
  }));

  const { counts, metrics } = useMemo(
    () => buildSeoActivityRangeStats(listQuery.dateRange, collections),
    [collections, listQuery.dateRange],
  );

  const allRows = useMemo(() => {
    const source =
      listQuery.type === "blogs"
        ? collections.blogs
        : listQuery.type === "backlinks"
          ? collections.backlinks
          : collections.web_changes;

    return source.filter((row) => isDateInRange(row.occurredOn, listQuery.dateRange));
  }, [collections, listQuery.dateRange, listQuery.type]);

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

  function onCreate(
    type: TSeoActivityType,
    row: TSeoActivityBlog | TSeoActivityBacklink | TSeoActivityWebChange,
  ) {
    setCollections((prev) => {
      if (type === "blogs") {
        return { ...prev, blogs: [row as TSeoActivityBlog, ...prev.blogs] };
      }
      if (type === "backlinks") {
        return { ...prev, backlinks: [row as TSeoActivityBacklink, ...prev.backlinks] };
      }
      return { ...prev, web_changes: [row as TSeoActivityWebChange, ...prev.web_changes] };
    });

    if (type !== listQuery.type) {
      onTypeChange(type);
    } else {
      deleteQueryParams(["page"]);
    }

    notify.success(t(`quickAdd.success.${type}`));
  }

  return (
    <div className="w-full min-w-0">
      <div className="space-y-5 px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Heading id="seo-activities-title" pageTitle>
            {t("title")}
          </Heading>
          <Button
            type="button"
            variant="gradient"
            size="md"
            onClick={() => setQuickAddOpen(true)}
            className="shrink-0 self-start sm:self-auto"
          >
            <IoAdd className="size-4" aria-hidden />
            {t("quickAdd.trigger")}
          </Button>
        </div>

        <SeoActivityTypeFilter
          activeType={listQuery.type}
          counts={counts}
          onTypeChange={onTypeChange}
          className="self-start"
        />

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

      <SeoActivityQuickAdd
        open={quickAddOpen}
        initialType={listQuery.type}
        onOpenChange={setQuickAddOpen}
        onCreate={onCreate}
      />
    </div>
  );
}
