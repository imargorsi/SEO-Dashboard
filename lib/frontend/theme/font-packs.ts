/** Font packs — next/font CSS variables on `<html>`; selection via `data-font` + localStorage. */

export {
  DEFAULT_FONT_PACK,
  FONT_PACK_IDS,
  resolveFontPackId,
  type TFontPackId,
} from "@/lib/theme/pack-ids";

import {
  DEFAULT_FONT_PACK,
  FONT_PACK_IDS,
  resolveFontPackId,
  type TFontPackId,
} from "@/lib/theme/pack-ids";

export const FONT_PACK_STORAGE_KEY = "dashboard-font-pack";

/** CSS custom property set by next/font `variable` on `<html>`. */
export type TFontPackMeta = {
  id: TFontPackId;
  /** i18n key under `settings.fontPacks.*` */
  nameKey: TFontPackId;
  descriptionKey: `${TFontPackId}Description`;
  /** Matches next/font `variable` name (without `--` prefix in docs; with `--` in CSS). */
  cssVariable: `--font-${TFontPackId}`;
  /** Short preview sample for Settings cards */
  sample: string;
};

export const FONT_PACKS: readonly TFontPackMeta[] = [
  {
    id: "jakarta",
    nameKey: "jakarta",
    descriptionKey: "jakartaDescription",
    cssVariable: "--font-jakarta",
    sample: "Aa Bb Cc 123",
  },
  {
    id: "ubuntu",
    nameKey: "ubuntu",
    descriptionKey: "ubuntuDescription",
    cssVariable: "--font-ubuntu",
    sample: "Aa Bb Cc 123",
  },
  {
    id: "nunito",
    nameKey: "nunito",
    descriptionKey: "nunitoDescription",
    cssVariable: "--font-nunito",
    sample: "Aa Bb Cc 123",
  },
  {
    id: "inter",
    nameKey: "inter",
    descriptionKey: "interDescription",
    cssVariable: "--font-inter",
    sample: "Aa Bb Cc 123",
  },
] as const;

const fontPackListeners = new Set<() => void>();

function emitFontPackChange(): void {
  fontPackListeners.forEach((listener) => listener());
}

/** Subscribe for `useSyncExternalStore` — fires on same-tab writes and cross-tab `storage`. */
export function subscribeFontPack(listener: () => void): () => void {
  fontPackListeners.add(listener);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", listener);
  }
  return () => {
    fontPackListeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", listener);
    }
  };
}

export function readStoredFontPack(): TFontPackId {
  if (typeof window === "undefined") return DEFAULT_FONT_PACK;
  try {
    const raw = window.localStorage.getItem(FONT_PACK_STORAGE_KEY);
    return resolveFontPackId(raw);
  } catch {
    return DEFAULT_FONT_PACK;
  }
}

export function writeStoredFontPack(packId: TFontPackId): void {
  try {
    window.localStorage.setItem(FONT_PACK_STORAGE_KEY, packId);
  } catch {
    /* ignore quota / private mode */
  }
  emitFontPackChange();
}

export function applyFontPackToDocument(packId: TFontPackId): void {
  document.documentElement.setAttribute("data-font", packId);
}

/** Inline bootstrap — run before paint to avoid font flash. */
export const FONT_PACK_BOOTSTRAP_SCRIPT = `(function(){try{var k=${JSON.stringify(FONT_PACK_STORAGE_KEY)};var d=${JSON.stringify(DEFAULT_FONT_PACK)};var allowed=${JSON.stringify([...FONT_PACK_IDS])};var p=localStorage.getItem(k);if(allowed.indexOf(p)<0)p=d;document.documentElement.setAttribute("data-font",p);}catch(e){document.documentElement.setAttribute("data-font",${JSON.stringify(DEFAULT_FONT_PACK)});}})();`;
