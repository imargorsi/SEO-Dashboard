"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { IoPencil, IoTrashOutline } from "react-icons/io5";

import type { TAppTableColumn } from "@/components/table/app-table";
import { TableRowIconActions } from "@/components/table/table-row-icon-actions";
import {
  SeoActivityDetailsCell,
  SeoActivityLinkCell,
  SeoActivityStackedDateCell,
} from "@/components/seo-activities/seo-activity-cells";
import type {
  TSeoActivityBacklink,
  TSeoActivityBlog,
  TSeoActivityType,
  TSeoActivityWebChange,
} from "@/types/seo-activity.types";

type TSeoActivityRow = TSeoActivityBlog | TSeoActivityBacklink | TSeoActivityWebChange;

type TUseSeoActivitiesTableColumnsOptions = {
  type: TSeoActivityType;
  canUpdate?: boolean;
  canDelete?: boolean;
  onEdit?: (row: TSeoActivityRow) => void;
  onDelete?: (row: TSeoActivityRow) => void;
};

function buildActionsColumn<T extends TSeoActivityRow>({
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
  t,
}: {
  canUpdate?: boolean;
  canDelete?: boolean;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  t: (key: "colActions" | "editActivity" | "deleteActivity") => string;
}): TAppTableColumn<T> | null {
  if (!canUpdate && !canDelete) return null;

  return {
    key: "actions",
    label: t("colActions"),
    align: "end",
    cellClassName: "px-4 py-4 sm:px-6",
    render: (item) => (
      <TableRowIconActions
        actions={[
          ...(canUpdate && onEdit
            ? [
                {
                  key: "edit",
                  icon: <IoPencil className="size-4" aria-hidden />,
                  label: t("editActivity"),
                  onClick: () => onEdit(item),
                },
              ]
            : []),
          ...(canDelete && onDelete
            ? [
                {
                  key: "delete",
                  icon: <IoTrashOutline className="size-4" aria-hidden />,
                  label: t("deleteActivity"),
                  onClick: () => onDelete(item),
                  className:
                    "text-destructive hover:bg-destructive/10 hover:text-destructive",
                },
              ]
            : []),
        ]}
      />
    ),
  };
}

export function useSeoActivitiesTableColumns({
  type,
  canUpdate = false,
  canDelete = false,
  onEdit,
  onDelete,
}: TUseSeoActivitiesTableColumnsOptions) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.seoActivities.table" });

  return useMemo(() => {
    const actionsColumn = buildActionsColumn({
      canUpdate,
      canDelete,
      onEdit,
      onDelete,
      t,
    });

    if (type === "blogs") {
      const columns: TAppTableColumn<TSeoActivityBlog>[] = [
        {
          key: "occurredOn",
          label: t("colDate"),
          cellClassName: "px-4 py-4 sm:px-6",
          render: (item) => <SeoActivityStackedDateCell isoDate={item.occurredOn} />,
        },
        {
          key: "title",
          label: t("colBlogDetails"),
          cellClassName: "px-4 py-4 sm:px-6",
          render: (item) => <SeoActivityDetailsCell title={item.title} />,
        },
        {
          key: "url",
          label: t("colBlogLink"),
          cellClassName: "px-4 py-4 sm:px-6",
          render: (item) => <SeoActivityLinkCell href={item.url} />,
        },
      ];
      if (actionsColumn) columns.push(actionsColumn as TAppTableColumn<TSeoActivityBlog>);
      return columns;
    }

    if (type === "backlinks") {
      const columns: TAppTableColumn<TSeoActivityBacklink>[] = [
        {
          key: "occurredOn",
          label: t("colDate"),
          cellClassName: "px-4 py-4 sm:px-6",
          render: (item) => <SeoActivityStackedDateCell isoDate={item.occurredOn} />,
        },
        {
          key: "anchorText",
          label: t("colBacklinkDetails"),
          cellClassName: "px-4 py-4 sm:px-6",
          render: (item) => <SeoActivityDetailsCell title={item.anchorText} />,
        },
        {
          key: "url",
          label: t("colUrls"),
          cellClassName: "px-4 py-4 sm:px-6",
          render: (item) => <SeoActivityLinkCell href={item.url} />,
        },
      ];
      if (actionsColumn) columns.push(actionsColumn as TAppTableColumn<TSeoActivityBacklink>);
      return columns;
    }

    const columns: TAppTableColumn<TSeoActivityWebChange>[] = [
      {
        key: "occurredOn",
        label: t("colDate"),
        cellClassName: "px-4 py-4 sm:px-6",
        render: (item) => <SeoActivityStackedDateCell isoDate={item.occurredOn} />,
      },
      {
        key: "details",
        label: t("colChangeDetails"),
        cellClassName: "px-4 py-4 sm:px-6",
        render: (item) => <SeoActivityDetailsCell title={item.details} />,
      },
      {
        key: "url",
        label: t("colPageLink"),
        cellClassName: "px-4 py-4 sm:px-6",
        render: (item) => <SeoActivityLinkCell href={item.url} />,
      },
    ];
    if (actionsColumn) columns.push(actionsColumn as TAppTableColumn<TSeoActivityWebChange>);
    return columns;
  }, [canDelete, canUpdate, onDelete, onEdit, t, type]);
}
