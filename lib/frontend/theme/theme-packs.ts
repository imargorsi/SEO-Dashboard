/** Color theme packs — values live in `styles/themes/*.css`; this is the registry + storage. */

export {
  DEFAULT_THEME_PACK,
  resolveThemePackId,
  THEME_PACK_ALIASES,
  THEME_PACK_IDS,
  type TThemePackId,
} from "@/lib/theme/pack-ids";

import {
  DEFAULT_THEME_PACK,
  resolveThemePackId,
  THEME_PACK_ALIASES,
  THEME_PACK_IDS,
  type TThemePackId,
} from "@/lib/theme/pack-ids";

export const THEME_PACK_STORAGE_KEY = "dashboard-theme-pack";

export type TThemePackMeta = {
  id: TThemePackId;
  /** i18n key under `settings.themePacks.*` */
  nameKey: TThemePackId;
  descriptionKey: `${TThemePackId}Description`;
  /** Preview swatches (hex) — Settings UI only; allowed AGENTS exception. Not runtime tokens. */
  swatches: readonly [string, string, string];
};

export const THEME_PACKS: readonly TThemePackMeta[] = [
  {
    id: "default",
    nameKey: "default",
    descriptionKey: "defaultDescription",
    swatches: ["#ff7952", "#e85a2a", "#1e222b"],
  },
  {
    id: "glass-aurora",
    nameKey: "glass-aurora",
    descriptionKey: "glass-auroraDescription",
    swatches: ["#5ea0ff", "#3b82f6", "#0a0f1f"],
  },
  {
    id: "verdant-grove",
    nameKey: "verdant-grove",
    descriptionKey: "verdant-groveDescription",
    swatches: ["#22c55e", "#b45309", "#0c110e"],
  },
  {
    id: "lumen-slate",
    nameKey: "lumen-slate",
    descriptionKey: "lumen-slateDescription",
    swatches: ["#818cf8", "#4338ca", "#070a10"],
  },
] as const;

const themePackListeners = new Set<() => void>();
function emitThemePackChange(): void {
  themePackListeners.forEach((listener) => listener());
}

/** Subscribe for `useSyncExternalStore` — fires on same-tab writes and cross-tab `storage`. */
export function subscribeThemePack(listener: () => void): () => void {
  themePackListeners.add(listener);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", listener);
  }
  return () => {
    themePackListeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", listener);
    }
  };
}

export function readStoredThemePack(): TThemePackId {
  if (typeof window === "undefined") return DEFAULT_THEME_PACK;
  try {
    const raw = window.localStorage.getItem(THEME_PACK_STORAGE_KEY);
    return resolveThemePackId(raw);
  } catch {
    return DEFAULT_THEME_PACK;
  }
}

/** Persist pack and migrate legacy ids. Safe to call from event handlers / effects. */
export function writeStoredThemePack(packId: TThemePackId): void {
  try {
    window.localStorage.setItem(THEME_PACK_STORAGE_KEY, packId);
  } catch {
    /* ignore quota / private mode */
  }
  emitThemePackChange();
}

/** One-shot migration of retired pack ids in localStorage. */
export function migrateStoredThemePackIfNeeded(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(THEME_PACK_STORAGE_KEY);
    if (!raw) return;
    const resolved = resolveThemePackId(raw);
    if (raw !== resolved) {
      window.localStorage.setItem(THEME_PACK_STORAGE_KEY, resolved);
    }
  } catch {
    /* ignore */
  }
}

export function applyThemePackToDocument(packId: TThemePackId): void {
  document.documentElement.setAttribute("data-theme", packId);
}

/** Optional brand preview asset under `public/brand/{id}.png`. */
export function themePackLogoSrc(packId: TThemePackId): string {
  return `/brand/${packId}.png`;
}

/** Inline bootstrap — run before paint to avoid theme flash. Keep in sync via THEME_PACK_IDS + aliases. */
export const THEME_PACK_BOOTSTRAP_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_PACK_STORAGE_KEY)};var d=${JSON.stringify(DEFAULT_THEME_PACK)};var allowed=${JSON.stringify([...THEME_PACK_IDS])};var aliases=${JSON.stringify(THEME_PACK_ALIASES)};var p=localStorage.getItem(k);if(aliases[p]){p=aliases[p];try{localStorage.setItem(k,p);}catch(e){}}if(allowed.indexOf(p)<0)p=d;document.documentElement.setAttribute("data-theme",p);}catch(e){document.documentElement.setAttribute("data-theme",${JSON.stringify(DEFAULT_THEME_PACK)});}})();`;
