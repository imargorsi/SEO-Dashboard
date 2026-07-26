"use client";

import { IoGridOutline, IoListOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";

import type { TProjectListViewMode } from "@/lib/frontend/projects/projects-list-view.utils";
import { toolbarFilterShellClass } from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

type TProjectListViewToggleProps = {
  viewMode: TProjectListViewMode;
  onViewModeChange: (mode: TProjectListViewMode) => void;
  className?: string;
};

const VIEW_OPTIONS: {
  id: TProjectListViewMode;
  icon: typeof IoGridOutline;
  labelKey: "cards" | "table";
}[] = [
  { id: "cards", icon: IoGridOutline, labelKey: "cards" },
  { id: "table", icon: IoListOutline, labelKey: "table" },
];

export function ProjectListViewToggle({
  viewMode,
  onViewModeChange,
  className,
}: TProjectListViewToggleProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects.viewMode" });

  return (
    <div
      className={cn(toolbarFilterShellClass, className)}
      role="group"
      aria-label={t("ariaLabel")}
    >
      {VIEW_OPTIONS.map((option) => {
        const isActive = viewMode === option.id;
        const Icon = option.icon;

        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={isActive}
            aria-label={t(option.labelKey)}
            title={t(option.labelKey)}
            onClick={() => onViewModeChange(option.id)}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-full transition-colors",
              isActive
                ? "bg-brand text-text-on-brand"
                : "text-text-muted hover:bg-bg-hover hover:text-text-primary",
            )}
          >
            <Icon className="size-4" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
