"use client";

import { useMemo } from "react";
import { IoArrowDown, IoArrowUp, IoCheckmark } from "react-icons/io5";
import { LuArrowUpDown } from "react-icons/lu";

import SelectDropdownArrowIcon from "@/components/icons/input-select-dropdown-arrow";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toolbarFilterControlClass } from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

export type TTableListSortOption = {
  value: string;
  label: string;
  /** Short label shown in the closed trigger (e.g. Newest). */
  shortLabel?: string;
};

type TTableListSortProps = {
  value: string;
  onChange: (value: string) => void;
  options: TTableListSortOption[];
  /** Trigger prefix, e.g. Sort By */
  label: string;
  ariaLabel?: string;
  className?: string;
};

function sortOptionIcon(option: TTableListSortOption, index: number) {
  if (option.value === "newest" || index === 0) return IoArrowUp;
  if (option.value === "oldest" || index === 1) return IoArrowDown;
  return null;
}

export function TableListSort({
  value,
  onChange,
  options,
  label,
  ariaLabel,
  className,
}: TTableListSortProps) {
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? options[0],
    [options, value],
  );
  const selectedShort =
    selectedOption?.shortLabel ?? selectedOption?.label ?? "";

  return (
    <DropdownMenu className={cn("shrink-0", className)}>
      <DropdownMenuTrigger
        type="button"
        aria-label={ariaLabel ?? `${label}: ${selectedShort}`}
        className={cn(
          toolbarFilterControlClass,
          "inline-flex items-center gap-2 bg-bg-card/40 px-3.5 type-label text-text-primary outline-none hover:bg-bg-hover/40 focus-visible:border-accent-border focus-visible:ring-2 focus-visible:ring-accent-border",
        )}
      >
        <LuArrowUpDown className="size-4 shrink-0 text-text-muted" aria-hidden />
        <span className="whitespace-nowrap">
          {label}: <span className="text-text-secondary">{selectedShort}</span>
        </span>
        <SelectDropdownArrowIcon className="ms-0.5 size-3.5 shrink-0 text-text-muted" aria-hidden />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="top-full mt-2 min-w-56 rounded-2xl"
      >
        <p className="px-2.5 pb-1.5 pt-1 type-caption text-text-muted">{label}</p>
        {options.map((option, index) => {
          const isSelected = option.value === value;
          const SortIcon = sortOptionIcon(option, index);

          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => onChange(option.value)}
              className={cn(
                "gap-2 rounded-xl px-2.5 py-2 type-label text-text-primary",
                isSelected && "bg-bg-hover/70",
              )}
            >
              {SortIcon ? (
                <SortIcon className="size-3.5 shrink-0 text-text-muted" aria-hidden />
              ) : (
                <span className="size-3.5 shrink-0" aria-hidden />
              )}
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
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
