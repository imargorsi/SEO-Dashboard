"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoCalendarOutline, IoChevronDown } from "react-icons/io5";

import {
  DATE_RANGE_PRESET_IDS,
  matchDateRangePreset,
  resolveDateRangePreset,
  type TDateRange,
  type TDateRangePresetId,
} from "@/lib/frontend/seo-activities/date-range.utils";
import { cn } from "@/lib/utils";

type TSeoActivityDateRangeFilterProps = {
  value: TDateRange;
  onChange: (range: TDateRange) => void;
  className?: string;
};

export function SeoActivityDateRangeFilter({
  value,
  onChange,
  className,
}: TSeoActivityDateRangeFilterProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.seoActivities.dateFilter" });
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const activePreset = matchDateRangePreset(value) ?? "last_30_days";

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function selectPreset(preset: TDateRangePresetId) {
    onChange(resolveDateRangePreset(preset));
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("ariaLabel")}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-bg-input px-3 type-label text-text-primary transition-colors",
          "hover:bg-bg-hover",
          open && "bg-bg-selected",
        )}
      >
        <IoCalendarOutline className="size-4 shrink-0 text-text-muted" aria-hidden />
        <span>{t(`presets.${activePreset}`)}</span>
        <IoChevronDown
          className={cn("size-3.5 shrink-0 text-text-muted transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label={t("ariaLabel")}
          className="absolute end-0 top-[calc(100%+0.5rem)] z-40 min-w-44 overflow-hidden rounded-2xl border border-border bg-bg-card p-1 shadow-lg"
        >
          {DATE_RANGE_PRESET_IDS.map((preset) => {
            const isActive = activePreset === preset;
            return (
              <button
                key={preset}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => selectPreset(preset)}
                className={cn(
                  "flex w-full rounded-xl px-3 py-2 text-start type-label transition-colors",
                  isActive
                    ? "bg-bg-selected text-text-primary"
                    : "text-text-secondary hover:bg-bg-hover hover:text-text-primary",
                )}
              >
                {t(`presets.${preset}`)}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
