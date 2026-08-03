"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { TSettingsCategory, TSettingsCategoryId } from "@/lib/frontend/settings/categories";
import { elevatedCardSurfaceClass } from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

type TSettingsCategoriesLayoutProps = {
  categories: readonly TSettingsCategory[];
  renderPanel: (categoryId: TSettingsCategoryId) => ReactNode;
};

const panelHeaderClass = "flex h-12 items-center px-1";

export function SettingsCategoriesLayout({
  categories,
  renderPanel,
}: TSettingsCategoriesLayoutProps) {
  const { t } = useTranslation("translation", { keyPrefix: "settings" });
  const [selectedCategoryId, setSelectedCategoryId] = useState<TSettingsCategoryId | null>(null);

  const activeCategoryId =
    selectedCategoryId && categories.some((category) => category.id === selectedCategoryId)
      ? selectedCategoryId
      : (categories[0]?.id ?? null);

  const activeCategory = categories.find((category) => category.id === activeCategoryId) ?? null;

  if (!activeCategory) return null;

  return (
    <div className="grid min-h-112 gap-4 lg:grid-cols-[240px_1fr]">
      <aside className={cn(elevatedCardSurfaceClass, "flex flex-col overflow-hidden rounded-xl p-3 sm:p-3.5")}>
        <div className={panelHeaderClass}>
          <h2 className="type-title text-text-primary">{t("categoriesHeading")}</h2>
        </div>

        <nav
          className="flex gap-2 overflow-x-auto pt-1 lg:flex-col lg:overflow-visible"
          aria-label={t("categoriesHeading")}
        >
          {categories.map((category) => {
            const isActive = category.id === activeCategoryId;
            const Icon = category.icon;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategoryId(category.id)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-2xl px-3 py-2.5 text-start type-body-strong transition-colors lg:w-full lg:shrink",
                  isActive
                    ? "bg-bg-selected text-text-primary"
                    : "text-text-secondary hover:bg-bg-hover/60 hover:text-text-primary",
                )}
              >
                <Icon className="size-4 shrink-0 text-text-muted" aria-hidden />
                <span className="truncate">{t(`categories.${category.labelKey}`)}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className={cn(elevatedCardSurfaceClass, "min-w-0 overflow-visible rounded-xl p-3 sm:p-4")}>
        <div className={panelHeaderClass}>
          <h2 className="type-title text-text-primary">
            {t(`categories.${activeCategory.labelKey}`)}
          </h2>
        </div>
        <div className="overflow-visible px-1 pt-3 sm:px-2">{renderPanel(activeCategory.id)}</div>
      </div>
    </div>
  );
}
