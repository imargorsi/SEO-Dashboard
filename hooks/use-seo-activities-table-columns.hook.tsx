"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { TAppTableColumn } from "@/components/table/app-table";
import {
  SeoActivityAnchorCell,
  SeoActivityLinkCell,
} from "@/components/seo-activities/seo-activity-cells";
import { SeoActivityDateBadge } from "@/components/seo-activities/seo-activity-date-badge";
import { formatSeoActivityDate } from "@/lib/frontend/seo-activities/format-date.utils";
import type {
  TSeoActivityBacklink,
  TSeoActivityBlog,
  TSeoActivityType,
  TSeoActivityWebChange,
} from "@/types/seo-activity.types";

function dash(value: string | null | undefined) {
  return value?.trim() ? value : "—";
}

export function useSeoActivitiesTableColumns(type: TSeoActivityType) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.seoActivities.table" });

  return useMemo(() => {
    if (type === "blogs") {
      const columns: TAppTableColumn<TSeoActivityBlog>[] = [
        {
          key: "occurredOn",
          label: t("colPublicationDate"),
          render: (item) => <SeoActivityDateBadge label={formatSeoActivityDate(item.occurredOn)} />,
        },
        {
          key: "site",
          label: t("colSite"),
          render: (item) => <span className="type-body-strong text-text-primary">{dash(item.site)}</span>,
        },
        {
          key: "title",
          label: t("colTitle"),
          cellClassName: "max-w-[16rem]",
          render: (item) => (
            <span className="line-clamp-2 type-body text-text-primary" title={item.title ?? undefined}>
              {dash(item.title)}
            </span>
          ),
        },
        {
          key: "url",
          label: t("colBlogLink"),
          render: (item) => <SeoActivityLinkCell href={item.url} />,
        },
      ];
      return columns;
    }

    if (type === "backlinks") {
      const columns: TAppTableColumn<TSeoActivityBacklink>[] = [
        {
          key: "occurredOn",
          label: t("colDatePosted"),
          render: (item) => <SeoActivityDateBadge label={formatSeoActivityDate(item.occurredOn)} />,
        },
        {
          key: "site",
          label: t("colSite"),
          render: (item) => <span className="type-body-strong text-text-primary">{dash(item.site)}</span>,
        },
        {
          key: "url",
          label: t("colUrls"),
          render: (item) => <SeoActivityLinkCell href={item.url} />,
        },
        {
          key: "anchorText",
          label: t("colAnchorTexts"),
          render: (item) => <SeoActivityAnchorCell label={item.anchorText} />,
        },
      ];
      return columns;
    }

    const columns: TAppTableColumn<TSeoActivityWebChange>[] = [
      {
        key: "occurredOn",
        label: t("colChangeDate"),
        render: (item) => <SeoActivityDateBadge label={formatSeoActivityDate(item.occurredOn)} />,
      },
      {
        key: "site",
        label: t("colSite"),
        render: (item) => <span className="type-body-strong text-text-primary">{dash(item.site)}</span>,
      },
      {
        key: "url",
        label: t("colPageLink"),
        render: (item) => <SeoActivityLinkCell href={item.url} />,
      },
      {
        key: "details",
        label: t("colDetails"),
        cellClassName: "max-w-[18rem]",
        render: (item) => (
          <span className="line-clamp-2 type-body text-text-primary" title={item.details ?? undefined}>
            {dash(item.details)}
          </span>
        ),
      },
    ];
    return columns;
  }, [t, type]);
}
