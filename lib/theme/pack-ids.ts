/** Shared pack id registries — safe for API schemas and UI (no browser APIs). */

export const THEME_PACK_IDS = ["default", "glass-aurora", "verdant-grove", "lumen-slate"] as const;
export type TThemePackId = (typeof THEME_PACK_IDS)[number];
export const DEFAULT_THEME_PACK: TThemePackId = "default";

export const FONT_PACK_IDS = ["jakarta", "ubuntu", "nunito", "inter"] as const;
export type TFontPackId = (typeof FONT_PACK_IDS)[number];
export const DEFAULT_FONT_PACK: TFontPackId = "jakarta";

/** Retired / legacy theme storage values → current pack ids */
export const THEME_PACK_ALIASES: Record<string, TThemePackId> = {
  obsidian: "default",
  "obsidian-focus": "default",
  "sunset-pulse": "default",
  "ember-forge": "lumen-slate",
  "carbon-ice": "verdant-grove",
};

export function resolveThemePackId(value: unknown): TThemePackId {
  if (typeof value !== "string") return DEFAULT_THEME_PACK;
  if ((THEME_PACK_IDS as readonly string[]).includes(value)) return value as TThemePackId;
  return THEME_PACK_ALIASES[value] ?? DEFAULT_THEME_PACK;
}

export function resolveFontPackId(value: unknown): TFontPackId {
  if (typeof value !== "string") return DEFAULT_FONT_PACK;
  if ((FONT_PACK_IDS as readonly string[]).includes(value)) return value as TFontPackId;
  return DEFAULT_FONT_PACK;
}
