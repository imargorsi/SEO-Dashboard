"use client";

import { Icons } from "@/lib/frontend/icons/app-icons";

import { useTranslation } from "react-i18next";

import type { TUserAccountStatus } from "@/lib/users/constants";
import type {
  TUserStatusCounts,
  TUserStatusFilter,
  TUserStatusFilterLabelKey,
} from "@/lib/users/user-status-filter.utils";
import { getStatusDotClassName, type TStatusColorKey } from "@/lib/frontend/theme/status-colors";
import { toolbarFilterChipClass, toolbarFilterShellClass } from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

type TStatusFilterOption = {
  id: TUserStatusFilter;
  labelKey: TUserStatusFilterLabelKey;
  icon?: typeof Icons.grid;
  statusColorKey?: TStatusColorKey;
};

const FILTER_OPTIONS: TStatusFilterOption[] = [
  { id: "all", labelKey: "all", icon: Icons.grid },
  { id: "active", labelKey: "active", statusColorKey: "active" },
  { id: "inactive", labelKey: "inactive", statusColorKey: "inactive" },
];

type UserStatusFilterProps = {
  activeStatus: TUserAccountStatus | null;
  counts: TUserStatusCounts;
  onStatusChange: (status: TUserAccountStatus | null) => void;
  className?: string;
};

export function UserStatusFilter({
  activeStatus,
  counts,
  onStatusChange,
  className,
}: UserStatusFilterProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.users.statusFilter" });
  const selectedFilter: TUserStatusFilter = activeStatus ?? "all";

  function handleSelect(nextFilter: TUserStatusFilter) {
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
      className={cn(toolbarFilterShellClass, className)}
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
              toolbarFilterChipClass,
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
                "inline-flex h-5 min-w-6 items-center justify-center rounded-full px-2 type-caption-xs leading-none tabular-nums",
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
