"use client";

import { ThemeProvider } from "@/context/theme-context";
import { I18nProvider } from "@/components/providers/i18n-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>{children}</I18nProvider>
    </ThemeProvider>
  );
}
