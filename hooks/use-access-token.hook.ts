"use client";

import { useSyncExternalStore } from "react";

import { getAccessToken, subscribeAuthSession } from "@/lib/frontend/auth/session";

function getServerAccessToken(): string | null {
  return null;
}

/** Reactive access token — updates on login, logout, and mid-session 401. */
export function useAccessToken(): string | null {
  return useSyncExternalStore(subscribeAuthSession, getAccessToken, getServerAccessToken);
}
