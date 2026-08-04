"use client";

import { useAuthUserQuery } from "@/features/auth/auth.api";
import { useUserPreferencesQuery } from "@/features/preferences/preferences.api";

/**
 * Loads account theme/font prefs after auth and writes them to localStorage
 * so pack providers + bootstrap stay consistent across devices.
 */
export function UserPreferencesSync() {
  const { isSuccess: isAuthReady } = useAuthUserQuery();
  useUserPreferencesQuery({ enabled: isAuthReady });
  return null;
}
