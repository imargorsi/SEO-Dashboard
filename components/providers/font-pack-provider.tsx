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
  applyFontPackToDocument,
  DEFAULT_FONT_PACK,
  readStoredFontPack,
  subscribeFontPack,
  writeStoredFontPack,
  type TFontPackId,
} from "@/lib/frontend/theme/font-packs";

type TFontPackContextValue = {
  fontPack: TFontPackId;
  setFontPack: (packId: TFontPackId) => void;
};

const FontPackContext = createContext<TFontPackContextValue | null>(null);

export function FontPackProvider({ children }: { children: ReactNode }) {
  const fontPack = useSyncExternalStore(
    subscribeFontPack,
    readStoredFontPack,
    () => DEFAULT_FONT_PACK,
  );

  useLayoutEffect(() => {
    applyFontPackToDocument(fontPack);
  }, [fontPack]);

  const setFontPack = useCallback((packId: TFontPackId) => {
    writeStoredFontPack(packId);
    applyFontPackToDocument(packId);
  }, []);

  const value = useMemo(
    () => ({
      fontPack,
      setFontPack,
    }),
    [fontPack, setFontPack],
  );

  return <FontPackContext.Provider value={value}>{children}</FontPackContext.Provider>;
}

export function useFontPack(): TFontPackContextValue {
  const ctx = useContext(FontPackContext);
  if (!ctx) {
    throw new Error("useFontPack must be used within FontPackProvider");
  }
  return ctx;
}
