/** Format a Date as `YYYY-MM-DD` in UTC. */
export function toUtcDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Parse `YYYY-MM-DD` as UTC midnight. */
export function parseUtcDateString(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/** Yesterday in UTC as `YYYY-MM-DD` (GSC/GA data for "today" is incomplete). */
export function utcYesterdayString(now = new Date()): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  d.setUTCDate(d.getUTCDate() - 1);
  return toUtcDateString(d);
}

export function addUtcDays(dateString: string, days: number): string {
  const d = parseUtcDateString(dateString);
  d.setUTCDate(d.getUTCDate() + days);
  return toUtcDateString(d);
}

/** Inclusive list of `YYYY-MM-DD` strings from `from` through `to` (UTC). */
export function enumerateUtcDateRange(from: string, to: string): string[] {
  if (from > to) return [];
  const dates: string[] = [];
  let cursor = from;
  while (cursor <= to) {
    dates.push(cursor);
    cursor = addUtcDays(cursor, 1);
  }
  return dates;
}

export function defaultAnalyticsDateRange(now = new Date()): { from: string; to: string } {
  const to = utcYesterdayString(now);
  const from = addUtcDays(to, -29);
  return { from, to };
}

/** Inclusive day count between two `YYYY-MM-DD` strings (UTC). */
export function inclusiveDaySpan(from: string, to: string): number {
  const start = parseUtcDateString(from).getTime();
  const end = parseUtcDateString(to).getTime();
  return Math.floor((end - start) / 86_400_000) + 1;
}
