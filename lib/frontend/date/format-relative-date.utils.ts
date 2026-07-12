const RELATIVE_UNITS: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
  { unit: "year", seconds: 60 * 60 * 24 * 365 },
  { unit: "month", seconds: 60 * 60 * 24 * 30 },
  { unit: "day", seconds: 60 * 60 * 24 },
  { unit: "hour", seconds: 60 * 60 },
  { unit: "minute", seconds: 60 },
  { unit: "second", seconds: 1 },
];

export function formatRelativeTime(isoDate: string, locale = "en"): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";

  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  for (const { unit, seconds } of RELATIVE_UNITS) {
    const delta = Math.round(diffSeconds / seconds);
    if (Math.abs(delta) >= 1 || unit === "second") {
      return formatter.format(delta, unit);
    }
  }

  return formatter.format(0, "second");
}

export function formatShortDate(isoDate: string, locale = "en"): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatLastActionTime(isoDate: string, locale = "en"): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";

  const ageDays = Math.abs(Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays < 7) return formatRelativeTime(isoDate, locale);
  return formatShortDate(isoDate, locale);
}
