"use client";

import { useTranslation } from "react-i18next";

import { AppTable, type TAppTableColumn } from "@/components/table/app-table";
import { useSeoActivitiesTableColumns } from "@/hooks/use-seo-activities-table-columns.hook";
import type {
  TSeoActivityBacklink,
  TSeoActivityBlog,
  TSeoActivityType,
  TSeoActivityWebChange,
} from "@/types/seo-activity.types";
import { cn } from "@/lib/utils";

type TSeoActivitiesTableProps = {
  type: TSeoActivityType;
  rows: TSeoActivityBlog[] | TSeoActivityBacklink[] | TSeoActivityWebChange[];
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function SeoActivitiesTable({
  type,
  rows,
  page,
  perPage,
  total,
  onPageChange,
  className,
}: TSeoActivitiesTableProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.seoActivities" });
  const columns = useSeoActivitiesTableColumns(type);
  const shown = Math.min(rows.length, perPage);
  const cardTitle = t(`typeFilter.${type}`);

  const pagination = {
    page,
    perPage,
    total,
    onPageChange,
    summaryLabel: t("table.summary", { shown, total }),
    previousPageLabel: t("table.previousPage"),
    nextPageLabel: t("table.nextPage"),
    pageNumberLabel: (pageNumber: number) => t("table.pageNumber", { page: pageNumber }),
  };

  return (
    <div className={cn("overflow-hidden rounded-3xl border border-border bg-bg-card", className)}>
      <div className="border-b border-border px-4 py-5 sm:px-6">
        <h2 className="type-title text-text-primary">{cardTitle}</h2>
      </div>

      {type === "blogs" ? (
        <AppTable<TSeoActivityBlog & Record<string, unknown>>
          className="rounded-none border-0 bg-transparent"
          columns={columns as TAppTableColumn<TSeoActivityBlog & Record<string, unknown>>[]}
          data={rows as Array<TSeoActivityBlog & Record<string, unknown>>}
          getRowId={(item) => item.id}
          emptyTitle={t("table.emptyTitle")}
          emptyBody={t("table.emptyBody")}
          pagination={pagination}
        />
      ) : type === "backlinks" ? (
        <AppTable<TSeoActivityBacklink & Record<string, unknown>>
          className="rounded-none border-0 bg-transparent"
          columns={columns as TAppTableColumn<TSeoActivityBacklink & Record<string, unknown>>[]}
          data={rows as Array<TSeoActivityBacklink & Record<string, unknown>>}
          getRowId={(item) => item.id}
          emptyTitle={t("table.emptyTitle")}
          emptyBody={t("table.emptyBody")}
          pagination={pagination}
        />
      ) : (
        <AppTable<TSeoActivityWebChange & Record<string, unknown>>
          className="rounded-none border-0 bg-transparent"
          columns={columns as TAppTableColumn<TSeoActivityWebChange & Record<string, unknown>>[]}
          data={rows as Array<TSeoActivityWebChange & Record<string, unknown>>}
          getRowId={(item) => item.id}
          emptyTitle={t("table.emptyTitle")}
          emptyBody={t("table.emptyBody")}
          pagination={pagination}
        />
      )}
    </div>
  );
}
