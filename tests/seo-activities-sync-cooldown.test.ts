import { describe, expect, it } from "vitest";

import {
  formatSeoActivitySyncCooldownMinutes,
  getSeoActivitySyncCooldownRemainingMs,
  SEO_ACTIVITY_SYNC_COOLDOWN_MS,
} from "@/lib/frontend/seo-activities/sync-cooldown.utils";

describe("seo activity sync cooldown", () => {
  it("returns full cooldown right after a successful sync", () => {
    const now = 1_000_000;
    expect(getSeoActivitySyncCooldownRemainingMs(now, now)).toBe(SEO_ACTIVITY_SYNC_COOLDOWN_MS);
  });

  it("returns zero after the hour elapses", () => {
    const now = 1_000_000;
    const lastSuccessAt = now - SEO_ACTIVITY_SYNC_COOLDOWN_MS;
    expect(getSeoActivitySyncCooldownRemainingMs(now, lastSuccessAt)).toBe(0);
  });

  it("formats remaining minutes with a one-minute floor", () => {
    expect(formatSeoActivitySyncCooldownMinutes(1)).toBe(1);
    expect(formatSeoActivitySyncCooldownMinutes(59_999)).toBe(1);
    expect(formatSeoActivitySyncCooldownMinutes(60_000)).toBe(1);
    expect(formatSeoActivitySyncCooldownMinutes(60_001)).toBe(2);
    expect(formatSeoActivitySyncCooldownMinutes(0)).toBe(0);
  });
});
