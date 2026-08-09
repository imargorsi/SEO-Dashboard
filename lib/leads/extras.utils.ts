import {
  LEAD_DATE_USE_TODAY,
  LEAD_EXTRAS_KEY_MAX_LENGTH,
  LEAD_EXTRAS_MAX_KEYS,
  LEAD_EXTRAS_VALUE_MAX_LENGTH,
  LEAD_FIELDS,
  LEAD_FIELD_SKIP,
} from "@/lib/leads/constants";
import type { TLeadColumnMapping, TLeadField } from "@/types/lead.types";

/** CSV headers currently assigned to a core Crawllex field. */
export function coreMappedHeaders(
  mapping: Pick<TLeadColumnMapping, TLeadField>,
): Set<string> {
  const used = new Set<string>();
  for (const field of LEAD_FIELDS) {
    const value = mapping[field];
    if (!value || value === LEAD_DATE_USE_TODAY || value === LEAD_FIELD_SKIP) continue;
    used.add(value);
  }
  return used;
}

/**
 * Unmapped headers default to Keep As Extra. Remembers explicit Skip while a
 * header stays unmapped; newly freed headers (unmapped from a core field) keep.
 */
export function reconcileExtrasHeaders(
  headers: readonly string[],
  mapping: Pick<TLeadColumnMapping, TLeadField>,
  previousExtras: readonly string[],
  previousUsed: ReadonlySet<string>,
): string[] {
  const used = coreMappedHeaders(mapping);
  const previousKeep = new Set(previousExtras);

  return headers.filter((header) => {
    if (used.has(header)) return false;
    if (previousKeep.has(header)) return true;
    // Newly unmapped (was assigned to a core field) → keep by default.
    return previousUsed.has(header);
  });
}

export function suggestExtrasHeaders(
  headers: readonly string[],
  mapping: Pick<TLeadColumnMapping, TLeadField>,
): string[] {
  const used = coreMappedHeaders(mapping);
  return headers.filter((header) => !used.has(header));
}

/** Build a plain string map from kept CSV columns (empty cells omitted). */
export function buildLeadExtras(
  row: Record<string, string>,
  extrasHeaders: readonly string[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const header of extrasHeaders) {
    if (Object.keys(out).length >= LEAD_EXTRAS_MAX_KEYS) break;
    const key = header.trim().slice(0, LEAD_EXTRAS_KEY_MAX_LENGTH);
    if (!key || key in out) continue;
    const value = (row[header] ?? "").trim().slice(0, LEAD_EXTRAS_VALUE_MAX_LENGTH);
    if (!value) continue;
    out[key] = value;
  }
  return out;
}

export function extrasRecordFromDoc(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") return {};
  if (value instanceof Map) {
    const out: Record<string, string> = {};
    for (const [key, raw] of value.entries()) {
      if (typeof key !== "string" || typeof raw !== "string") continue;
      const trimmed = raw.trim();
      if (!trimmed) continue;
      out[key] = trimmed;
    }
    return out;
  }
  const out: Record<string, string> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (typeof raw !== "string") continue;
    const trimmed = raw.trim();
    if (!trimmed) continue;
    out[key] = trimmed;
  }
  return out;
}
