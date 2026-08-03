"use client";

import { LanguageSwitcher } from "@/components/language-switcher";

/** Shared auth card chrome — language only (auth layout forces dark). */
export function AuthFormToolbar() {
  return (
    <div className="flex items-center gap-2">
      <LanguageSwitcher tone="ghost" size="sm" />
    </div>
  );
}
