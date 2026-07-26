"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  applyThemePackToDocument,
  DEFAULT_THEME_PACK,
  migrateStoredThemePackIfNeeded,
  readStoredThemePack,
  subscribeThemePack,
  writeStoredThemePack,
  type TThemePackId,
} from "@/lib/frontend/theme/theme-packs";

type TThemePackContextValue = {
  themePack: TThemePackId;
  setThemePack: (packId: TThemePackId) => void;
};

const ThemePackContext = createContext<TThemePackContextValue | null>(null);

export function ThemePackProvider({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    migrateStoredThemePackIfNeeded();
  }, []);

  const themePack = useSyncExternalStore(
    subscribeThemePack,
    readStoredThemePack,
    () => DEFAULT_THEME_PACK,
  );

  useLayoutEffect(() => {
    applyThemePackToDocument(themePack);
  }, [themePack]);

  const setThemePack = useCallback((packId: TThemePackId) => {
    writeStoredThemePack(packId);
    applyThemePackToDocument(packId);
  }, []);

  const value = useMemo(
    () => ({
      themePack,
      setThemePack,
    }),
    [themePack, setThemePack],
  );

  return <ThemePackContext.Provider value={value}>{children}</ThemePackContext.Provider>;
}

export function useThemePack(): TThemePackContextValue {
  const ctx = useContext(ThemePackContext);
  if (!ctx) {
    throw new Error("useThemePack must be used within ThemePackProvider");
  }
  return ctx;
}
