"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { IoCalendarOutline, IoChevronBack, IoChevronDown, IoChevronForward } from "react-icons/io5";

import { Button } from "@/components/ui/button";
import {
  buildMonthCalendarDays,
  DATE_RANGE_PRESET_IDS,
  formatDateRangeLabel,
  matchDateRangePreset,
  normalizeDateRange,
  resolveDateRangePreset,
  shiftMonth,
  type TDateRange,
  type TDateRangePresetId,
} from "@/lib/frontend/seo-activities/date-range.utils";
import { popoverSurfaceClass } from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

type TSeoActivityDateRangeFilterProps = {
  value: TDateRange;
  onChange: (range: TDateRange) => void;
  className?: string;
  /** Override preset list (default: all SEO activity presets). */
  presets?: readonly TDateRangePresetId[];
  /** Override i18n keyPrefix (default: `modules.seoActivities.dateFilter`). */
  i18nKeyPrefix?: string;
  /** Custom preset resolver (default: `resolveDateRangePreset`). */
  resolvePreset?: (preset: TDateRangePresetId, now?: Date) => TDateRange;
  /** Custom preset matcher (default: `matchDateRangePreset`). */
  matchPreset?: (range: TDateRange, now?: Date) => TDateRangePresetId | null;
};

type TPopupPosition = {
  top: number;
  left: number;
  width: number;
};

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
const POPUP_WIDTH = 520;
const POPUP_GAP = 8;

export function SeoActivityDateRangeFilter({
  value,
  onChange,
  className,
  presets = DATE_RANGE_PRESET_IDS,
  i18nKeyPrefix = "modules.seoActivities.dateFilter",
  resolvePreset = resolveDateRangePreset,
  matchPreset = matchDateRangePreset,
}: TSeoActivityDateRangeFilterProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { t } = useTranslation("translation", { keyPrefix: i18nKeyPrefix as any }) as { t: (...args: any[]) => string };
  const rootRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<TDateRange>(value);
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [position, setPosition] = useState<TPopupPosition | null>(null);

  const activePreset = matchPreset(value);
  const draftPreset = matchPreset(draft);

  const triggerLabel = useMemo(() => {
    if (activePreset) return t(`presets.${activePreset}`);
    return formatDateRangeLabel(value, {
      all: t("presets.all"),
      separator: t("separator"),
    });
  }, [activePreset, t, value]);

  const monthLabels = t("months", { returnObjects: true }) as unknown as string[];
  const monthLabel = monthLabels[viewMonth] ?? "";
  const calendarDays = useMemo(
    () => buildMonthCalendarDays(viewYear, viewMonth),
    [viewMonth, viewYear],
  );

  function updatePosition() {
    const trigger = rootRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const width = Math.min(POPUP_WIDTH, window.innerWidth - 16);
    let left = rect.right - width;
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
    const top = rect.bottom + POPUP_GAP;

    setPosition({ top, left, width });
  }

  useEffect(() => {
    if (!open) return;
    setDraft(value);
    setSelectingEnd(false);
    const anchor = value.to ?? value.from;
    if (anchor) {
      const [year, month] = anchor.split("-").map(Number);
      setViewYear(year!);
      setViewMonth(month! - 1);
    } else {
      const now = new Date();
      setViewYear(now.getFullYear());
      setViewMonth(now.getMonth());
    }
  }, [open, value]);

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    updatePosition();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (popupRef.current?.contains(target)) return;
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    function onReposition() {
      updatePosition();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  function applyPreset(preset: TDateRangePresetId) {
    setDraft(resolvePreset(preset));
    setSelectingEnd(false);
  }

  function onDayClick(isoDate: string) {
    if (!draft.from || (draft.from && draft.to) || !selectingEnd) {
      setDraft({ from: isoDate, to: null });
      setSelectingEnd(true);
      return;
    }

    if (isoDate < draft.from) {
      setDraft({ from: isoDate, to: draft.from });
    } else {
      setDraft({ from: draft.from, to: isoDate });
    }
    setSelectingEnd(false);
  }

  function isInRange(isoDate: string): boolean {
    if (!draft.from) return false;
    const end = draft.to ?? (selectingEnd ? draft.from : null);
    if (!end) return isoDate === draft.from;
    return isoDate >= draft.from && isoDate <= end;
  }

  function isRangeEdge(isoDate: string): boolean {
    return isoDate === draft.from || isoDate === draft.to;
  }

  function onApply() {
    onChange(normalizeDateRange(draft));
    setOpen(false);
  }

  function onReset() {
    const cleared = resolvePreset(presets[0]!);
    setDraft(cleared);
    onChange(cleared);
    setOpen(false);
  }

  const popup =
    open && position
      ? createPortal(
          <div
            ref={popupRef}
            role="dialog"
            aria-label={t("ariaLabel")}
            style={{ top: position.top, left: position.left, width: position.width }}
            className={cn("fixed z-50 overflow-hidden rounded-2xl", popoverSurfaceClass)}
          >
            <div className="grid sm:grid-cols-[9rem_1fr]">
              <aside className="border-b border-border p-2 sm:border-b-0 sm:border-e">
                <nav
                  className="flex gap-1 overflow-x-auto sm:flex-col sm:overflow-visible"
                  aria-label={t("presetsHeading")}
                >
                  {presets.map((preset) => {
                    const isActive = draftPreset === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className={cn(
                          "shrink-0 rounded-xl px-3 py-2 text-start type-label transition-colors",
                          isActive
                            ? "bg-bg-selected text-text-primary"
                            : "text-text-secondary hover:bg-bg-hover hover:text-text-primary",
                        )}
                      >
                        {t(`presets.${preset}`)}
                      </button>
                    );
                  })}
                </nav>
              </aside>

              <div className="space-y-3 p-3 sm:p-4">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    aria-label={t("previousMonth")}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
                    onClick={() => {
                      const next = shiftMonth(viewYear, viewMonth, -1);
                      setViewYear(next.year);
                      setViewMonth(next.monthIndex);
                    }}
                  >
                    <IoChevronBack className="size-4" aria-hidden />
                  </button>
                  <p className="type-body-strong text-text-primary">
                    {monthLabel} {viewYear}
                  </p>
                  <button
                    type="button"
                    aria-label={t("nextMonth")}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
                    onClick={() => {
                      const next = shiftMonth(viewYear, viewMonth, 1);
                      setViewYear(next.year);
                      setViewMonth(next.monthIndex);
                    }}
                  >
                    <IoChevronForward className="size-4" aria-hidden />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {WEEKDAY_KEYS.map((key) => (
                    <span
                      key={key}
                      className="flex h-8 items-center justify-center type-caption text-text-muted"
                    >
                      {t(`weekdays.${key}`)}
                    </span>
                  ))}
                  {calendarDays.map((day) => {
                    const selected = isRangeEdge(day.isoDate);
                    const inRange = isInRange(day.isoDate);
                    return (
                      <button
                        key={day.isoDate}
                        type="button"
                        onClick={() => onDayClick(day.isoDate)}
                        className={cn(
                          "flex h-8 items-center justify-center rounded-lg type-caption transition-colors",
                          day.inCurrentMonth ? "text-text-primary" : "text-text-muted/50",
                          inRange && !selected && "bg-bg-selected text-text-primary",
                          selected && "bg-brand text-text-on-brand",
                          !selected && "hover:bg-bg-hover",
                        )}
                      >
                        {day.day}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <div className="rounded-xl border border-border bg-bg-input px-3 py-2 type-caption text-text-secondary">
                    {draft.from ?? t("fromPlaceholder")}
                  </div>
                  <span className="type-caption text-text-muted">{t("separator")}</span>
                  <div className="rounded-xl border border-border bg-bg-input px-3 py-2 type-caption text-text-secondary">
                    {draft.to ?? t("toPlaceholder")}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3">
              <Button type="button" variant="outline" size="sm" onClick={onReset}>
                {t("reset")}
              </Button>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button type="button" variant="gradient" size="sm" onClick={onApply}>
                  {t("apply")}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      <Button
        type="button"
        variant="outline"
        size="md"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={t("ariaLabel")}
        onClick={() => setOpen((prev) => !prev)}
        className={cn("gap-2", open && "bg-bg-selected")}
      >
        <IoCalendarOutline className="size-4 shrink-0 text-text-muted" aria-hidden />
        <span className="max-w-48 truncate font-semibold">{triggerLabel}</span>
        <IoChevronDown
          className={cn("size-3.5 shrink-0 text-text-muted transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </Button>
      {popup}
    </div>
  );
}
