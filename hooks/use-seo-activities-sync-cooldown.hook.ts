"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import {
  getLastSuccessfulSeoActivitySyncAt,
  getSeoActivitySyncCooldownRemainingMs,
  isSeoActivitySyncOnCooldown,
  markSeoActivitySyncSuccess,
  SEO_ACTIVITY_SYNC_COOLDOWN_STORAGE_KEY,
} from "@/lib/frontend/seo-activities/sync-cooldown.utils";

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const onStorage = (event: StorageEvent) => {
    if (event.key === SEO_ACTIVITY_SYNC_COOLDOWN_STORAGE_KEY || event.key === null) {
      onStoreChange();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener("seo-activities-sync-cooldown", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("seo-activities-sync-cooldown", onStoreChange);
  };
}

function getSnapshot(): number | null {
  return getLastSuccessfulSeoActivitySyncAt();
}

function getServerSnapshot(): number | null {
  return null;
}

/**
 * Frontend-only 1-hour cooldown after a successful SEO Activities sync.
 * Persisted in localStorage so refresh cannot bypass it.
 */
export function useSeoActivitiesSyncCooldown() {
  const lastSuccessAt = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [now, setNow] = useState(() => Date.now());

  const remainingMs = getSeoActivitySyncCooldownRemainingMs(now, lastSuccessAt);
  const isOnCooldown = remainingMs > 0;

  useEffect(() => {
    if (!isOnCooldown) return;

    const timeout = window.setTimeout(() => {
      setNow(Date.now());
    }, Math.min(remainingMs, 30_000));

    return () => window.clearTimeout(timeout);
  }, [isOnCooldown, lastSuccessAt, remainingMs]);

  const markSuccess = useCallback(() => {
    markSeoActivitySyncSuccess();
    setNow(Date.now());
  }, []);

  const canSync = useCallback(() => !isSeoActivitySyncOnCooldown(), []);

  return {
    isOnCooldown,
    remainingMs,
    markSuccess,
    canSync,
  };
}
