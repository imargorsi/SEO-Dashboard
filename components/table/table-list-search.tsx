"use client";

import { useEffect, useRef, useState } from "react";

import { Spinner } from "@/components/ui/spinner";
import {
  DEFAULT_TABLE_SEARCH_DEBOUNCE_MS,
  useDebouncedValue,
} from "@/hooks/use-debounced-value.hook";
import { Icons } from "@/lib/frontend/icons/app-icons";
import { toolbarFilterControlClass } from "@/lib/frontend/layout/dashboard-chrome";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState(value ?? "");
  const [prevValue, setPrevValue] = useState(value);

  // Sync from URL/parent only when the field is not focused, so debounce round-trips
  // cannot wipe keystrokes the user typed after the last emit.
  if (value !== prevValue) {
    setPrevValue(value);
    if (inputRef.current !== document.activeElement) {
      setSearchValue(value ?? "");
    }
  }

  const debouncedSearchValue = useDebouncedValue(searchValue, debounceMs);

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
  const showSpinner = isLoading || isDebouncing;

  return (
    <div className={cn("relative w-full sm:w-[26rem]", className)}>
      <Icons.search
        className="pointer-events-none absolute top-1/2 start-3 z-10 size-4 -translate-y-1/2 text-text-muted"
        aria-hidden
      />
      <input
        ref={inputRef}
        type="search"
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className={cn(
          toolbarFilterControlClass,
          "w-full bg-bg-card/40 pe-10 ps-10 type-body text-text-primary outline-none placeholder:text-text-placeholder hover:bg-bg-hover/40 focus-visible:border-accent-border focus-visible:ring-2 focus-visible:ring-accent-border",
        )}
      />
      {showSpinner ? (
        <Spinner className="absolute top-1/2 end-3 z-10 size-4 -translate-y-1/2 text-text-muted" />
      ) : null}
    </div>
  );
}
