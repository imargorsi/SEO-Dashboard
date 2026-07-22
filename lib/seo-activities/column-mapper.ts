export type TMappedSheetRow = {
  sourceRowNumber: number;
  siteName: string | null;
  title: string | null;
  url: string | null;
  details: string | null;
  anchorText: string | null;
  occurredOnRaw: string | null;
  occurredOn: Date | null;
};

type THeaderIndex = {
  site: number | null;
  title: number | null;
  url: number | null;
  details: number | null;
  anchorText: number | null;
  occurredOn: number | null;
};

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function findHeaderIndex(headers: string[], aliases: readonly string[]): number | null {
  const normalized = headers.map(normalizeHeader);
  for (const alias of aliases) {
    const index = normalized.indexOf(alias);
    if (index >= 0) return index;
  }
  return null;
}

const SITE_ALIASES = ["site", "client", "brand", "project", "project name"] as const;
const TITLE_ALIASES = ["title", "blog title", "post title"] as const;
const URL_ALIASES = [
  "blog link",
  "page link",
  "url",
  "urls",
  "link",
  "backlinks",
  "backlink",
] as const;
const DETAILS_ALIASES = ["details", "description", "notes", "work done"] as const;
const ANCHOR_ALIASES = ["anchor text", "anchor texts", "anchor"] as const;
const DATE_ALIASES = [
  "publication date",
  "change date",
  "date posted",
  "post date",
  "publish date",
  "update date",
  "date",
] as const;

export function buildHeaderIndex(headers: string[]): THeaderIndex {
  return {
    site: findHeaderIndex(headers, SITE_ALIASES),
    title: findHeaderIndex(headers, TITLE_ALIASES),
    url: findHeaderIndex(headers, URL_ALIASES),
    details: findHeaderIndex(headers, DETAILS_ALIASES),
    anchorText: findHeaderIndex(headers, ANCHOR_ALIASES),
    occurredOn: findHeaderIndex(headers, DATE_ALIASES),
  };
}

export function assertRequiredHeaders(index: THeaderIndex): void {
  if (index.site == null) {
    throw new Error("Sheet Is Missing A Required Site Column.");
  }
}

function cellAt(row: string[], index: number | null): string | null {
  if (index == null) return null;
  const value = row[index]?.trim() ?? "";
  return value === "" ? null : value;
}

/** Parses common sheet date formats such as `02-Jun-2026`. */
export function parseSheetDate(raw: string | null): Date | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const match = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(trimmed);
  if (match) {
    const day = Number(match[1]);
    const monthToken = match[2]!.toLowerCase();
    const year = Number(match[3]);
    const months: Record<string, number> = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11,
    };
    const month = months[monthToken];
    if (month != null && Number.isFinite(day) && Number.isFinite(year)) {
      const date = new Date(Date.UTC(year, month, day));
      if (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month &&
        date.getUTCDate() === day
      ) {
        return date;
      }
    }
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  return null;
}

export function mapCsvRows(rows: string[][]): TMappedSheetRow[] {
  if (rows.length === 0) {
    throw new Error("Sheet CSV Is Empty.");
  }

  const headers = rows[0] ?? [];
  const index = buildHeaderIndex(headers);
  assertRequiredHeaders(index);

  const mapped: TMappedSheetRow[] = [];

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i] ?? [];
    const sourceRowNumber = i + 1;
    const siteRaw = cellAt(row, index.site);
    const occurredOnRaw = cellAt(row, index.occurredOn);

    mapped.push({
      sourceRowNumber,
      siteName: siteRaw,
      title: cellAt(row, index.title),
      url: cellAt(row, index.url),
      details: cellAt(row, index.details),
      anchorText: cellAt(row, index.anchorText),
      occurredOnRaw,
      occurredOn: parseSheetDate(occurredOnRaw),
    });
  }

  return mapped;
}
