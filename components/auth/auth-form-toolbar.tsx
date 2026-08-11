"use client";

import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

/** Shared auth card chrome — theme + language (follows active light/dark + theme pack). */
export function AuthFormToolbar() {
  return (
    <div className="flex items-center gap-2">
      <ThemeToggle tone="ghost" size="sm" />
      <LanguageSwitcher size="sm" />
    </div>
  );
}
