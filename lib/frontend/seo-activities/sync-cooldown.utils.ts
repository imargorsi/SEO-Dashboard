import { SEO_ACTIVITY_SYNC_COOLDOWN_MS as SHARED_SYNC_COOLDOWN_MS } from "@/lib/seo-activities/constants";

/** Frontend UX mirror of server cooldown (server still enforces). */
export const SEO_ACTIVITY_SYNC_COOLDOWN_MS = SHARED_SYNC_COOLDOWN_MS;

export const SEO_ACTIVITY_SYNC_COOLDOWN_STORAGE_KEY = "seo-activities-last-successful-sync-at";

function readStoredTimestamp(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SEO_ACTIVITY_SYNC_COOLDOWN_STORAGE_KEY);
    if (!raw) return null;
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

export function getLastSuccessfulSeoActivitySyncAt(): number | null {
  return readStoredTimestamp();
}

export function markSeoActivitySyncSuccess(at: number = Date.now()): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SEO_ACTIVITY_SYNC_COOLDOWN_STORAGE_KEY, String(at));
    window.dispatchEvent(new Event("seo-activities-sync-cooldown"));
  } catch {
    // Ignore storage failures — button still works without persistence.
  }
}

export function getSeoActivitySyncCooldownRemainingMs(
  now: number = Date.now(),
  lastSuccessAt: number | null = readStoredTimestamp(),
): number {
  if (lastSuccessAt == null) return 0;
  const remaining = lastSuccessAt + SEO_ACTIVITY_SYNC_COOLDOWN_MS - now;
  return remaining > 0 ? remaining : 0;
}

export function isSeoActivitySyncOnCooldown(now: number = Date.now()): boolean {
  return getSeoActivitySyncCooldownRemainingMs(now) > 0;
}

/** Whole minutes left, at least 1 while cooldown is active. */
export function formatSeoActivitySyncCooldownMinutes(remainingMs: number): number {
  if (remainingMs <= 0) return 0;
  return Math.max(1, Math.ceil(remainingMs / 60_000));
}
