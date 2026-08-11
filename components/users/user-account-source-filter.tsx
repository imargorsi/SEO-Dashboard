"use client";

import { useMemo } from "react";
import type { IconType } from "react-icons";
import { useTranslation } from "react-i18next";
import { IoCheckmark, IoGridOutline } from "react-icons/io5";
import { LuFilter } from "react-icons/lu";

import SelectDropdownArrowIcon from "@/components/icons/input-select-dropdown-arrow";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ACCOUNT_SOURCE_ICON } from "@/lib/frontend/users/account-source-display";
import { toolbarFilterControlClass } from "@/lib/frontend/layout/dashboard-chrome";
import type { TUserAccountSourceKnown } from "@/lib/users/account-source";
import type {
  TUserAccountSourceCounts,
  TUserAccountSourceFilter,
} from "@/lib/users/account-source-filter.utils";
import { cn } from "@/lib/utils";

type TSourceFilterOption = {
  id: TUserAccountSourceFilter;
  labelKey: "all" | TUserAccountSourceKnown;
  icon: IconType;
};

const FILTER_OPTIONS: TSourceFilterOption[] = [
  { id: "all", labelKey: "all", icon: IoGridOutline },
  { id: "admin", labelKey: "admin", icon: ACCOUNT_SOURCE_ICON.admin },
  { id: "self_register", labelKey: "self_register", icon: ACCOUNT_SOURCE_ICON.self_register },
  { id: "google", labelKey: "google", icon: ACCOUNT_SOURCE_ICON.google },
];

type UserAccountSourceFilterProps = {
  activeSource: TUserAccountSourceKnown | null;
  counts: TUserAccountSourceCounts;
  onSourceChange: (source: TUserAccountSourceKnown | null) => void;
  className?: string;
};

/** Account-source filter — dropdown chrome matching `TableListSort`. */
export function UserAccountSourceFilter({
  activeSource,
  counts,
  onSourceChange,
  className,
}: UserAccountSourceFilterProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.users.accountSourceFilter" });
  const { t: tSource } = useTranslation("translation", { keyPrefix: "modules.users.accountSource" });
  const selectedFilter: TUserAccountSourceFilter = activeSource ?? "all";

  const selectedOption = useMemo(
    () => FILTER_OPTIONS.find((option) => option.id === selectedFilter) ?? FILTER_OPTIONS[0]!,
    [selectedFilter],
  );

  const selectedLabel =
    selectedOption.labelKey === "all" ? t("all") : tSource(selectedOption.labelKey);

  function handleSelect(nextFilter: TUserAccountSourceFilter) {
    onSourceChange(nextFilter === "all" ? null : nextFilter);
  }

  return (
    <DropdownMenu className={cn("shrink-0", className)}>
      <DropdownMenuTrigger
        type="button"
        aria-label={t("ariaLabel")}
        className={cn(
          toolbarFilterControlClass,
          "inline-flex items-center gap-2 bg-bg-card/40 px-3.5 type-label text-text-primary outline-none hover:bg-bg-hover/40 focus-visible:border-accent-border focus-visible:ring-2 focus-visible:ring-accent-border",
        )}
      >
        <LuFilter className="size-4 shrink-0 text-text-muted" aria-hidden />
        <span className="whitespace-nowrap">
          {t("label")}: <span className="text-text-secondary">{selectedLabel}</span>
        </span>
        <SelectDropdownArrowIcon className="ms-0.5 size-3.5 shrink-0 text-text-muted" aria-hidden />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="top-full mt-2 min-w-56 rounded-2xl">
        <p className="px-2.5 pb-1.5 pt-1 type-caption text-text-muted">{t("label")}</p>
        {FILTER_OPTIONS.map((option) => {
          const isSelected = option.id === selectedFilter;
          const Icon = option.icon;
          const label = option.labelKey === "all" ? t("all") : tSource(option.labelKey);

          return (
            <DropdownMenuItem
              key={option.id}
              onSelect={() => handleSelect(option.id)}
              className={cn(
                "gap-2 rounded-xl px-2.5 py-2 type-label text-text-primary",
                isSelected && "bg-bg-hover/70",
              )}
            >
              <Icon className="size-3.5 shrink-0 text-text-muted" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{label}</span>
              <span
                className={cn(
                  "inline-flex h-5 min-w-6 items-center justify-center rounded-full px-1.5 type-caption-xs tabular-nums",
                  isSelected ? "bg-bg-hover text-text-primary" : "bg-bg-hover/70 text-text-muted",
                )}
              >
                {counts[option.id]}
              </span>
              {isSelected ? (
                <IoCheckmark className="size-3.5 shrink-0 text-text-primary" aria-hidden />
              ) : (
                <span className="size-3.5 shrink-0" aria-hidden />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
