"use client";

import { useMemo } from "react";
import { IoArrowDown, IoArrowUp } from "react-icons/io5";

import { cn } from "@/lib/utils";

export type TTableListSortOption = {
  value: string;
  label: string;
};

type TTableListSortProps = {
  value: string;
  onChange: (value: string) => void;
  options: TTableListSortOption[];
  ariaLabel?: string;
  className?: string;
};

function getNextSortValue(current: string, options: TTableListSortOption[]): string {
  if (options.length < 2) return current;

  const currentIndex = options.findIndex((option) => option.value === current);
  const nextIndex = currentIndex === 0 ? 1 : 0;
  return options[nextIndex]?.value ?? options[0]!.value;
}

export function TableListSort({ value, onChange, options, ariaLabel, className }: TTableListSortProps) {
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? options[0],
    [options, value],
  );

  // Newest (first option) → up; Oldest → down
  const isNewest = value === "newest" || value === options[0]?.value;
  const SortIcon = isNewest ? IoArrowUp : IoArrowDown;
  const nextValue = getNextSortValue(value, options);

  return (
    <button
      type="button"
      aria-label={ariaLabel ?? `Sort: ${selectedOption?.label ?? ""}`}
      onClick={() => onChange(nextValue)}
      className={cn(
        "box-border inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border-2 border-text-muted/50 bg-transparent px-4 type-body text-text-primary transition-colors hover:bg-bg-hover focus-visible:border-text-secondary/70 focus-visible:ring-2 focus-visible:ring-accent-border focus-visible:outline-none sm:w-auto",
        className,
      )}
    >
      <SortIcon className="size-4 shrink-0 text-brand" aria-hidden />
      <span>{selectedOption?.label}</span>
    </button>
  );
}
