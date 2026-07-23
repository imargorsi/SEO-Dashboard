"use client";

import { useTranslation } from "react-i18next";

import { SEO_ACTIVITY_TYPE_OPTIONS } from "@/lib/frontend/seo-activities/constants";
import { getStatusDotClassName } from "@/lib/frontend/theme/status-colors";
import type { TSeoActivityType, TSeoActivityTypeCounts } from "@/types/seo-activity.types";
import { cn } from "@/lib/utils";

type TSeoActivityTypeFilterProps = {
  activeType: TSeoActivityType;
  counts: TSeoActivityTypeCounts;
  onTypeChange: (type: TSeoActivityType) => void;
  className?: string;
};

export function SeoActivityTypeFilter({
  activeType,
  counts,
  onTypeChange,
  className,
}: TSeoActivityTypeFilterProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.seoActivities.typeFilter" });

  return (
    <div
      className={cn(
        "inline-flex max-w-full flex-wrap items-center gap-1 rounded-2xl border border-border bg-bg-input p-1",
        className,
      )}
      role="group"
      aria-label={t("ariaLabel")}
    >
      {SEO_ACTIVITY_TYPE_OPTIONS.map((type) => {
        const isActive = activeType === type;

        return (
          <button
            key={type}
            type="button"
            aria-pressed={isActive}
            onClick={() => onTypeChange(type)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-3 py-2 type-label transition-colors",
              isActive
                ? "bg-brand text-text-on-brand"
                : "text-text-secondary hover:bg-bg-hover hover:text-text-primary",
            )}
          >
            <span
              className={cn(
                "size-2 shrink-0 rounded-full",
                isActive ? getStatusDotClassName("active") : "bg-text-muted",
              )}
              aria-hidden
            />
            <span>{t(type)}</span>
            <span
              className={cn(
                "inline-flex min-w-6 items-center justify-center rounded-md px-1.5 py-0.5 type-caption-xs tabular-nums",
                isActive ? "bg-text-on-brand/15 text-text-on-brand" : "bg-bg-hover text-text-muted",
              )}
            >
              {counts[type]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
