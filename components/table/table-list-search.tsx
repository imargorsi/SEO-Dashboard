"use client";

import { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";

import { Spinner } from "@/components/ui/spinner";
import {
  DEFAULT_TABLE_SEARCH_DEBOUNCE_MS,
  useDebouncedValue,
} from "@/hooks/use-debounced-value.hook";
import { cn } from "@/lib/utils";

type TTableListSearchProps = {
  value: string | null;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel?: string;
  isLoading?: boolean;
  debounceMs?: number;
  className?: string;
};

export function TableListSearch({
  value,
  onChange,
  placeholder,
  ariaLabel,
  isLoading = false,
  debounceMs = DEFAULT_TABLE_SEARCH_DEBOUNCE_MS,
  className,
}: TTableListSearchProps) {
  const [searchValue, setSearchValue] = useState(value ?? "");
  const debouncedSearchValue = useDebouncedValue(searchValue, debounceMs);

  useEffect(() => {
    setSearchValue(value ?? "");
  }, [value]);

  useEffect(() => {
    const trimmed = searchValue.trim();
    const current = value?.trim() ?? "";

    if (trimmed === "" && current !== "") {
      onChange("");
    }
  }, [onChange, searchValue, value]);

  useEffect(() => {
    const trimmed = debouncedSearchValue.trim();
    const current = value?.trim() ?? "";

    if (!trimmed || trimmed === current) return;

    onChange(trimmed);
  }, [debouncedSearchValue, onChange, value]);

  const isDebouncing = searchValue.trim() !== (value?.trim() ?? "");

  return (
    <div className={cn("relative w-full sm:max-w-sm", className)}>
      <IoSearch
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted"
        aria-hidden
      />
      <input
        type="search"
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="h-10 w-full rounded-xl border border-border bg-bg-input pr-10 pl-10 type-body text-text-primary outline-none placeholder:text-text-placeholder focus-visible:ring-2 focus-visible:ring-accent-border"
      />
      {isLoading || isDebouncing ? (
        <Spinner className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-text-muted" />
      ) : null}
    </div>
  );
}
