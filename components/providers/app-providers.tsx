"use client";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthRevealProvider } from "@/context/auth-reveal-transition";
import { Toaster } from "@/components/ui/sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <I18nProvider>
          <AuthRevealProvider>
            {children}
            <Toaster />
          </AuthRevealProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
