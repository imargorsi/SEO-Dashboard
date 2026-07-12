"use client";

import type { IconType } from "react-icons";
import { IoGridOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";

import type { ProjectStatus } from "@/lib/projects/constants";
import type { TProjectStatusCounts, TProjectStatusFilter, TProjectStatusFilterLabelKey } from "@/lib/projects/project-status-filter.utils";
import {
  getStatusDotClassName,
  type TStatusColorKey,
} from "@/lib/frontend/theme/status-colors";
import { cn } from "@/lib/utils";

type TStatusFilterOption = {
  id: TProjectStatusFilter;
  labelKey: TProjectStatusFilterLabelKey;
  icon?: IconType;
  statusColorKey?: TStatusColorKey;
};

const FILTER_OPTIONS: TStatusFilterOption[] = [
  { id: "all", labelKey: "all", icon: IoGridOutline },
  { id: "active", labelKey: "active", statusColorKey: "active" },
  { id: "pending", labelKey: "pending", statusColorKey: "pending" },
  { id: "rejected", labelKey: "rejected", statusColorKey: "rejected" },
  { id: "inactive", labelKey: "inactive", statusColorKey: "inactive" },
];

type ProjectStatusFilterProps = {
  activeStatus: ProjectStatus | null;
  counts: TProjectStatusCounts;
  onStatusChange: (status: ProjectStatus | null) => void;
  className?: string;
};

export function ProjectStatusFilter({
  activeStatus,
  counts,
  onStatusChange,
  className,
}: ProjectStatusFilterProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects.statusFilter" });
  const selectedFilter: TProjectStatusFilter = activeStatus ?? "all";

  function handleSelect(nextFilter: TProjectStatusFilter) {
    if (nextFilter === selectedFilter) {
      if (nextFilter !== "all") {
        onStatusChange(null);
      }
      return;
    }

    onStatusChange(nextFilter === "all" ? null : nextFilter);
  }

  return (
    <div
      className={cn(
        "inline-flex max-w-full flex-wrap items-center gap-1 rounded-2xl border border-border bg-bg-input p-1",
        className,
      )}
      role="group"
      aria-label={t("ariaLabel")}
    >
      {FILTER_OPTIONS.map((option) => {
        const isActive = selectedFilter === option.id;
        const Icon = option.icon;
        const dotClassName =
          option.statusColorKey != null ? getStatusDotClassName(option.statusColorKey) : undefined;

        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => handleSelect(option.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-3 py-2 type-label transition-colors",
              isActive
                ? "bg-brand text-text-on-brand"
                : "text-text-secondary hover:bg-bg-hover hover:text-text-primary",
            )}
          >
            {Icon ? (
              <Icon className="size-4 shrink-0" aria-hidden />
            ) : dotClassName ? (
              <span className={cn("size-2 shrink-0 rounded-full", dotClassName)} aria-hidden />
            ) : null}
            <span>{t(option.labelKey)}</span>
            <span
              className={cn(
                "inline-flex min-w-6 items-center justify-center rounded-md px-1.5 py-0.5 type-caption-xs tabular-nums",
                isActive ? "bg-text-on-brand/15 text-text-on-brand" : "bg-bg-hover text-text-muted",
              )}
            >
              {counts[option.id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
