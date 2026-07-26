"use client";

import { useTranslation } from "react-i18next";

import { SEO_ACTIVITY_TYPE_OPTIONS } from "@/lib/frontend/seo-activities/constants";
import { getStatusDotClassName } from "@/lib/frontend/theme/status-colors";
import { toolbarFilterChipClass, toolbarFilterShellClass } from "@/lib/frontend/layout/dashboard-chrome";
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
      className={cn(toolbarFilterShellClass, className)}
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
              toolbarFilterChipClass,
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
                "inline-flex h-5 min-w-6 items-center justify-center rounded-full px-2 type-caption-xs leading-none tabular-nums",
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
