"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { TSettingsCategory, TSettingsCategoryId } from "@/lib/frontend/settings/categories";
import { cn } from "@/lib/utils";

type TSettingsCategoriesLayoutProps = {
  categories: readonly TSettingsCategory[];
  renderPanel: (categoryId: TSettingsCategoryId) => ReactNode;
};

const panelHeaderClass =
  "flex h-14 items-center border-b border-border px-4 sm:px-5";

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
    <div
      className={cn(
        "grid min-h-112 gap-0 overflow-hidden rounded-2xl border border-border bg-bg-card",
        "lg:grid-cols-[240px_1fr]",
      )}
    >
      <aside className="border-b border-border bg-bg-input/30 lg:border-b-0 lg:border-e">
        <div className={panelHeaderClass}>
          <h2 className="type-title text-text-primary">{t("categoriesHeading")}</h2>
        </div>

        <nav
          className="flex gap-1.5 overflow-x-auto p-3 lg:flex-col lg:overflow-visible"
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
                  "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-start type-body-strong transition-colors lg:w-full lg:shrink",
                  isActive
                    ? "bg-bg-selected text-text-primary"
                    : "text-text-secondary hover:bg-bg-hover hover:text-text-primary",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{t(`categories.${category.labelKey}`)}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0">
        <div className={panelHeaderClass}>
          <h2 className="type-title text-text-primary">
            {t(`categories.${activeCategory.labelKey}`)}
          </h2>
        </div>
        <div className="p-5 sm:p-6">{renderPanel(activeCategory.id)}</div>
      </div>
    </div>
  );
}
