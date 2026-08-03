import type { IconType } from "react-icons";
import { IoColorPaletteOutline, IoLinkOutline } from "react-icons/io5";

export const SETTINGS_CATEGORY_IDS = ["theme", "integrations"] as const;

export type TSettingsCategoryId = (typeof SETTINGS_CATEGORY_IDS)[number];

export type TSettingsCategory = {
  id: TSettingsCategoryId;
  /** i18n key under `settings.categories.*` */
  labelKey: TSettingsCategoryId;
  icon: IconType;
  /** When true, only `super_admin` sees this category. */
  requiresSuperAdmin: boolean;
  /** When true, needs `integrations.view` on the selected project (`super_admin` always qualifies). */
  requiresIntegrationsView?: boolean;
};

export const SETTINGS_CATEGORIES: readonly TSettingsCategory[] = [
  {
    id: "theme",
    labelKey: "theme",
    icon: IoColorPaletteOutline,
    requiresSuperAdmin: false,
  },
  {
    id: "integrations",
    labelKey: "integrations",
    icon: IoLinkOutline,
    requiresSuperAdmin: false,
    requiresIntegrationsView: true,
  },
];

export function resolveSettingsCategories(options: {
  isAdmin: boolean;
  canViewIntegrations: boolean;
}): TSettingsCategory[] {
  return SETTINGS_CATEGORIES.filter((category) => {
    if (category.requiresSuperAdmin && !options.isAdmin) return false;
    if (category.requiresIntegrationsView && !options.isAdmin && !options.canViewIntegrations) {
      return false;
    }
    return true;
  });
}
