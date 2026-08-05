"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  AUTH_SESSION_EXPIRED_EVENT,
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_USER_STORAGE_KEY,
} from "@/lib/frontend/auth/session";

/**
 * When another tab changes auth keys, or this tab gets a mid-session 401,
 * drop React Query cache so users cannot stay mixed in the same browser profile.
 */
export function AuthSessionSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    function clearCache() {
      void queryClient.cancelQueries();
      queryClient.clear();
    }

    function onStorage(event: StorageEvent) {
      const authKeyChanged =
        event.key === AUTH_TOKEN_STORAGE_KEY ||
        event.key === AUTH_USER_STORAGE_KEY ||
        event.key === null;

      if (!authKeyChanged) return;
      clearCache();
    }

    function onSessionExpired() {
      clearCache();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, onSessionExpired);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, onSessionExpired);
    };
  }, [queryClient]);

  return null;
}
