import type { IconType } from "react-icons";
import { IoColorPaletteOutline, IoSearchOutline } from "react-icons/io5";

export const SETTINGS_CATEGORY_IDS = ["seo-activities", "theme"] as const;

export type TSettingsCategoryId = (typeof SETTINGS_CATEGORY_IDS)[number];

export type TSettingsCategory = {
  id: TSettingsCategoryId;
  /** i18n key under `settings.categories.*` */
  labelKey: TSettingsCategoryId;
  icon: IconType;
  /** When true, only `super_admin` sees this category. */
  requiresSuperAdmin: boolean;
};

export const SETTINGS_CATEGORIES: readonly TSettingsCategory[] = [
  {
    id: "seo-activities",
    labelKey: "seo-activities",
    icon: IoSearchOutline,
    requiresSuperAdmin: true,
  },
  {
    id: "theme",
    labelKey: "theme",
    icon: IoColorPaletteOutline,
    requiresSuperAdmin: false,
  },
];

export function resolveSettingsCategories(isAdmin: boolean): TSettingsCategory[] {
  return SETTINGS_CATEGORIES.filter((category) => !category.requiresSuperAdmin || isAdmin);
}
