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

type TSeoActivityTableRow = (
  | TSeoActivityBlog
  | TSeoActivityBacklink
  | TSeoActivityWebChange
) &
  Record<string, unknown>;

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
  const columns = useSeoActivitiesTableColumns(type) as TAppTableColumn<TSeoActivityTableRow>[];
  const shown = Math.min(rows.length, perPage);

  return (
    <AppTable<TSeoActivityTableRow>
      className={className}
      columns={columns}
      data={rows as TSeoActivityTableRow[]}
      getRowId={(item) => item.id as string}
      emptyTitle={t("table.emptyTitle")}
      emptyBody={t("table.emptyBody")}
      pagination={{
        page,
        perPage,
        total,
        onPageChange,
        summaryLabel: t("table.summary", { shown, total }),
        previousPageLabel: t("table.previousPage"),
        nextPageLabel: t("table.nextPage"),
        pageNumberLabel: (pageNumber: number) => t("table.pageNumber", { page: pageNumber }),
      }}
    />
  );
}
