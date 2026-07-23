export type TDateRange = {
  from: string | null;
  to: string | null;
};

export type TDateRangePresetId =
  | "all"
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_30_days"
  | "this_month"
  | "last_month";

export const DATE_RANGE_PRESET_IDS: readonly TDateRangePresetId[] = [
  "all",
  "today",
  "yesterday",
  "last_7_days",
  "last_30_days",
  "this_month",
  "last_month",
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

export function resolveDateRangePreset(preset: TDateRangePresetId, now = new Date()): TDateRange {
  const today = startOfDay(now);

  switch (preset) {
    case "today":
      return { from: toIsoDate(today), to: toIsoDate(today) };
    case "yesterday": {
      const yesterday = addDays(today, -1);
      return { from: toIsoDate(yesterday), to: toIsoDate(yesterday) };
    }
    case "last_7_days":
      return { from: toIsoDate(addDays(today, -6)), to: toIsoDate(today) };
    case "last_30_days":
      return { from: toIsoDate(addDays(today, -29)), to: toIsoDate(today) };
    case "this_month":
      return {
        from: toIsoDate(new Date(today.getFullYear(), today.getMonth(), 1)),
        to: toIsoDate(today),
      };
    case "last_month": {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: toIsoDate(start), to: toIsoDate(end) };
    }
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
