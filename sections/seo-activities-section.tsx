"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoAdd, IoDownloadOutline } from "react-icons/io5";

import { SeoActivitiesTable } from "@/components/seo-activities/seo-activities-table";
import { SeoActivityDateRangeFilter } from "@/components/seo-activities/seo-activity-date-range-filter";
import {
  SeoActivityQuickAdd,
  type TSeoActivityEditorTarget,
} from "@/components/seo-activities/seo-activity-quick-add";
import { SeoActivitySummaryCards } from "@/components/seo-activities/seo-activity-summary-cards";
import { SeoActivityTypeFilter } from "@/components/seo-activities/seo-activity-type-filter";
import { Heading } from "@/components/heading";
import { EmptyState } from "@/components/ui/empty-state";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { useSelectedProject } from "@/context/selected-project-context";
import { useProjectAccess } from "@/context/project-access-context";
import { useAuthUserQuery } from "@/features/auth/auth.api";
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
import { downloadSeoActivitiesExcel } from "@/lib/frontend/seo-activities/export.utils";
import {
  createSeedSeoActivityCollections,
  type TSeoActivityCollections,
} from "@/lib/frontend/seo-activities/quick-add.utils";
import { buildSeoActivityRangeStats } from "@/lib/frontend/seo-activities/summary.utils";
import { hasPermission, mergePermissions } from "@/lib/rbac/access";
import { cn } from "@/lib/utils";
import type {
  TSeoActivityBacklink,
  TSeoActivityBlog,
  TSeoActivityType,
  TSeoActivityWebChange,
} from "@/types/seo-activity.types";

type TSeoActivityRow = TSeoActivityBlog | TSeoActivityBacklink | TSeoActivityWebChange;

function seedCollections(): TSeoActivityCollections {
  return createSeedSeoActivityCollections(
    DUMMY_SEO_ACTIVITY_BLOGS,
    DUMMY_SEO_ACTIVITY_BACKLINKS,
    DUMMY_SEO_ACTIVITY_WEB_CHANGES,
  );
}

export function SeoActivitiesSection() {
  const { t } = useTranslation("translation", { keyPrefix: "modules.seoActivities" });
  const { queryParams, updateQueryParams, deleteQueryParams } = useQueryParams();
  const listQuery = parseSeoActivitiesListQuery(queryParams);
  const { selectedProject } = useSelectedProject();
  const projectId = selectedProject?.id ?? null;
  const { data: authUser } = useAuthUserQuery();
  const { projectPermissions } = useProjectAccess();

  const permissions = useMemo(
    () => mergePermissions(authUser?.permissions ?? [], projectPermissions),
    [authUser?.permissions, projectPermissions],
  );
  const canCreate = hasPermission(permissions, "seo_activities.create");
  const canUpdate = hasPermission(permissions, "seo_activities.update");
  const canDelete = hasPermission(permissions, "seo_activities.delete");

  const [storeByProject, setStoreByProject] = useState<Record<string, TSeoActivityCollections>>({});
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorTarget, setEditorTarget] = useState<TSeoActivityEditorTarget>({
    mode: "create",
    type: listQuery.type,
  });
  const [deleteTarget, setDeleteTarget] = useState<TSeoActivityRow | null>(null);

  const collections = useMemo(() => {
    if (!projectId) {
      return { blogs: [], backlinks: [], web_changes: [] } satisfies TSeoActivityCollections;
    }
    return storeByProject[projectId] ?? seedCollections();
  }, [projectId, storeByProject]);

  const updateProjectCollections = useCallback(
    (updater: (prev: TSeoActivityCollections) => TSeoActivityCollections) => {
      if (!projectId) return;
      setStoreByProject((prev) => ({
        ...prev,
        [projectId]: updater(prev[projectId] ?? seedCollections()),
      }));
    },
    [projectId],
  );

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

  function openCreate() {
    setEditorTarget({ mode: "create", type: listQuery.type });
    setEditorOpen(true);
  }

  function openEdit(row: TSeoActivityRow) {
    setEditorTarget({ mode: "edit", type: listQuery.type, row });
    setEditorOpen(true);
  }

  function onSave(
    type: TSeoActivityType,
    row: TSeoActivityRow,
    mode: "create" | "edit",
  ) {
    updateProjectCollections((prev) => {
      if (type === "blogs") {
        const nextRow = row as TSeoActivityBlog;
        if (mode === "edit") {
          return {
            ...prev,
            blogs: prev.blogs.map((item) => (item.id === nextRow.id ? nextRow : item)),
          };
        }
        return { ...prev, blogs: [nextRow, ...prev.blogs] };
      }

      if (type === "backlinks") {
        const nextRow = row as TSeoActivityBacklink;
        if (mode === "edit") {
          return {
            ...prev,
            backlinks: prev.backlinks.map((item) => (item.id === nextRow.id ? nextRow : item)),
          };
        }
        return { ...prev, backlinks: [nextRow, ...prev.backlinks] };
      }

      const nextRow = row as TSeoActivityWebChange;
      if (mode === "edit") {
        return {
          ...prev,
          web_changes: prev.web_changes.map((item) => (item.id === nextRow.id ? nextRow : item)),
        };
      }
      return { ...prev, web_changes: [nextRow, ...prev.web_changes] };
    });

    if (mode === "create") {
      if (type !== listQuery.type) onTypeChange(type);
      else deleteQueryParams(["page"]);
      notify.success(t(`quickAdd.success.${type}`));
      return;
    }

    notify.success(t(`quickAdd.updateSuccess.${type}`));
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    const type = listQuery.type;

    updateProjectCollections((prev) => {
      if (type === "blogs") {
        return { ...prev, blogs: prev.blogs.filter((item) => item.id !== id) };
      }
      if (type === "backlinks") {
        return { ...prev, backlinks: prev.backlinks.filter((item) => item.id !== id) };
      }
      return { ...prev, web_changes: prev.web_changes.filter((item) => item.id !== id) };
    });

    setDeleteTarget(null);
    notify.success(t("table.deleteSuccess"));
  }

  function onExportExcel() {
    if (allRows.length === 0) {
      notify.info(t("export.empty"));
      return;
    }

    downloadSeoActivitiesExcel({
      type: listQuery.type,
      rows: allRows,
      range: listQuery.dateRange,
      labels: {
        date: t("table.colDate"),
        title: t("table.colBlogDetails"),
        url:
          listQuery.type === "blogs"
            ? t("table.colBlogLink")
            : listQuery.type === "backlinks"
              ? t("table.colUrls")
              : t("table.colPageLink"),
        anchorText: t("table.colBacklinkDetails"),
        details: t("table.colChangeDetails"),
      },
    });
    notify.success(t("export.success"));
  }

  if (!projectId) {
    return (
      <div className="w-full min-w-0 px-4 py-6 sm:px-6">
        <EmptyState title={t("selectProjectTitle")} description={t("selectProjectBody")} />
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
          {canCreate ? (
            <Button
              type="button"
              variant="gradient"
              size="md"
              onClick={openCreate}
              className="shrink-0 self-start sm:self-auto"
            >
              <IoAdd className="size-4" aria-hidden />
              {t("quickAdd.trigger")}
            </Button>
          ) : null}
        </div>

        <SeoActivityTypeFilter
          activeType={listQuery.type}
          counts={counts}
          onTypeChange={onTypeChange}
          className="self-start"
        />

        <SeoActivitySummaryCards metrics={metrics} />

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <SeoActivityDateRangeFilter value={listQuery.dateRange} onChange={onDateRangeChange} />
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onExportExcel}
              className="shrink-0"
            >
              <IoDownloadOutline className="size-4" aria-hidden />
              {t("export.excel")}
            </Button>
          </div>

          <SeoActivitiesTable
            type={listQuery.type}
            rows={rows as TSeoActivityBlog[] | TSeoActivityBacklink[] | TSeoActivityWebChange[]}
            page={listQuery.page}
            perPage={listQuery.perPage}
            total={allRows.length}
            onPageChange={onPageChange}
            canUpdate={canUpdate}
            canDelete={canDelete}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />
        </div>
      </div>

      <SeoActivityQuickAdd
        open={editorOpen}
        target={editorTarget}
        onOpenChange={setEditorOpen}
        onSave={onSave}
      />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("table.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("table.deleteBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("table.deleteCancel")}</AlertDialogCancel>
            <button
              type="button"
              className={cn(buttonVariants({ variant: "destructive", size: "sm" }))}
              onClick={confirmDelete}
            >
              {t("table.deleteConfirm")}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
