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

type TSeoActivityRow = TSeoActivityBlog | TSeoActivityBacklink | TSeoActivityWebChange;

type TSeoActivitiesTableProps = {
  type: TSeoActivityType;
  rows: TSeoActivityBlog[] | TSeoActivityBacklink[] | TSeoActivityWebChange[];
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
  onEdit?: (row: TSeoActivityRow) => void;
  onDelete?: (row: TSeoActivityRow) => void;
  isLoading?: boolean;
  className?: string;
};

export function SeoActivitiesTable({
  type,
  rows,
  page,
  perPage,
  total,
  onPageChange,
  canUpdate = false,
  canDelete = false,
  onEdit,
  onDelete,
  isLoading = false,
  className,
}: TSeoActivitiesTableProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.seoActivities" });
  const columns = useSeoActivitiesTableColumns({
    type,
    canUpdate,
    canDelete,
    onEdit,
    onDelete,
  }) as TAppTableColumn<TSeoActivityTableRow>[];
  const shown = Math.min(rows.length, perPage);

  return (
    <AppTable<TSeoActivityTableRow>
      className={className}
      columns={columns}
      data={rows as TSeoActivityTableRow[]}
      getRowId={(item) => item.id as string}
      emptyTitle={t("table.emptyTitle")}
      emptyBody={t("table.emptyBody")}
      isLoading={isLoading}
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
