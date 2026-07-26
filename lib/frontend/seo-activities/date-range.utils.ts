export type TDateRange = {
  from: string | null;
  to: string | null;
};

export type TDateRangePresetId =
  | "all"
  | "last_15_days"
  | "last_30_days"
  | "last_month"
  | "this_month"
  | "last_year"
  | "this_year";

export const DATE_RANGE_PRESET_IDS: readonly TDateRangePresetId[] = [
  "all",
  "last_15_days",
  "last_30_days",
  "last_month",
  "this_month",
  "last_year",
  "this_year",
] as const;

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function isValidIsoDate(value: string | null | undefined): value is string {
  if (!value) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year!, month! - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month! - 1 &&
    date.getDate() === day
  );
}

export function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year!, month! - 1, day);
}

export function resolveDateRangePreset(preset: TDateRangePresetId, now = new Date()): TDateRange {
  const today = startOfDay(now);

  switch (preset) {
    case "last_15_days":
      return { from: toIsoDate(addDays(today, -14)), to: toIsoDate(today) };
    case "last_30_days":
      return { from: toIsoDate(addDays(today, -29)), to: toIsoDate(today) };
    case "last_month": {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: toIsoDate(start), to: toIsoDate(end) };
    }
    case "this_month":
      return {
        from: toIsoDate(new Date(today.getFullYear(), today.getMonth(), 1)),
        to: toIsoDate(today),
      };
    case "last_year": {
      const year = today.getFullYear() - 1;
      return {
        from: toIsoDate(new Date(year, 0, 1)),
        to: toIsoDate(new Date(year, 11, 31)),
      };
    }
    case "this_year":
      return {
        from: toIsoDate(new Date(today.getFullYear(), 0, 1)),
        to: toIsoDate(today),
      };
    case "all":
    default:
      return { from: null, to: null };
  }
}

export function matchDateRangePreset(range: TDateRange, now = new Date()): TDateRangePresetId | null {
  for (const preset of DATE_RANGE_PRESET_IDS) {
    const resolved = resolveDateRangePreset(preset, now);
    if (resolved.from === range.from && resolved.to === range.to) {
      return preset;
    }
  }
  return null;
}

export function normalizeDateRange(range: TDateRange): TDateRange {
  const from = isValidIsoDate(range.from) ? range.from : null;
  const to = isValidIsoDate(range.to) ? range.to : null;
  if (from && to && from > to) {
    return { from: to, to: from };
  }
  return { from, to };
}

export function isDateInRange(isoDate: string | null | undefined, range: TDateRange): boolean {
  if (!range.from && !range.to) return true;
  if (!isoDate || !isValidIsoDate(isoDate)) return false;
  if (range.from && isoDate < range.from) return false;
  if (range.to && isoDate > range.to) return false;
  return true;
}

export function formatDateRangeLabel(
  range: TDateRange,
  labels: { all: string; separator: string },
): string {
  if (!range.from && !range.to) return labels.all;
  if (range.from && range.to && range.from === range.to) return range.from;
  if (range.from && range.to) return `${range.from} ${labels.separator} ${range.to}`;
  return range.from ?? range.to ?? labels.all;
}

export type TCalendarDay = {
  isoDate: string;
  day: number;
  inCurrentMonth: boolean;
};

/** Builds a Sunday-start 6-week grid for the given month. */
export function buildMonthCalendarDays(year: number, monthIndex: number): TCalendarDay[] {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const startOffset = firstOfMonth.getDay();
  const gridStart = addDays(firstOfMonth, -startOffset);
  const days: TCalendarDay[] = [];

  for (let i = 0; i < 42; i += 1) {
    const date = addDays(gridStart, i);
    days.push({
      isoDate: toIsoDate(date),
      day: date.getDate(),
      inCurrentMonth: date.getMonth() === monthIndex,
    });
  }

  return days;
}

export function shiftMonth(
  year: number,
  monthIndex: number,
  delta: number,
): {
  year: number;
  monthIndex: number;
} {
  const date = new Date(year, monthIndex + delta, 1);
  return { year: date.getFullYear(), monthIndex: date.getMonth() };
}
