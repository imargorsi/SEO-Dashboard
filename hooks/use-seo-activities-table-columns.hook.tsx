"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { TAppTableColumn } from "@/components/table/app-table";
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

export function useSeoActivitiesTableColumns(type: TSeoActivityType) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.seoActivities.table" });

  return useMemo(() => {
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
          render: (item) => (
            <SeoActivityDetailsCell title={item.title} projectName={item.projectName} />
          ),
        },
        {
          key: "url",
          label: t("colBlogLink"),
          cellClassName: "px-4 py-4 sm:px-6",
          render: (item) => <SeoActivityLinkCell href={item.url} />,
        },
      ];
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
          render: (item) => (
            <SeoActivityDetailsCell title={item.anchorText} projectName={item.projectName} />
          ),
        },
        {
          key: "url",
          label: t("colUrls"),
          cellClassName: "px-4 py-4 sm:px-6",
          render: (item) => <SeoActivityLinkCell href={item.url} />,
        },
      ];
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
        render: (item) => (
          <SeoActivityDetailsCell title={item.details} projectName={item.projectName} />
        ),
      },
      {
        key: "url",
        label: t("colPageLink"),
        cellClassName: "px-4 py-4 sm:px-6",
        render: (item) => <SeoActivityLinkCell href={item.url} />,
      },
    ];
    return columns;
  }, [t, type]);
}
