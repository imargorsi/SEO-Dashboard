"use client";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { ThemePackProvider } from "@/components/providers/theme-pack-provider";
import { FontPackProvider } from "@/components/providers/font-pack-provider";
import { UserPreferencesSync } from "@/components/providers/user-preferences-sync";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthRevealProvider } from "@/context/auth-reveal-transition";
import { Toaster } from "@/components/ui/sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <ThemePackProvider>
          <FontPackProvider>
            <I18nProvider>
              <AuthRevealProvider>
                <UserPreferencesSync />
                {children}
                <Toaster />
              </AuthRevealProvider>
            </I18nProvider>
          </FontPackProvider>
        </ThemePackProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
