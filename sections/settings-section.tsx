"use client";

import { useTranslation } from "react-i18next";

import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { SettingsCategoriesLayout } from "@/components/settings/settings-categories-layout";
import { SettingsSeoActivitiesPanel } from "@/components/settings/settings-seo-activities-panel";
import { SettingsThemePanel } from "@/components/settings/settings-theme-panel";
import { LoadingState } from "@/components/ui/loading-state";
import { StateCard } from "@/components/ui/state-card";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { resolveSettingsCategories } from "@/lib/frontend/settings/categories";
import { isSuperAdmin } from "@/lib/rbac/access";

export function SettingsSection() {
  const { t } = useTranslation("translation", { keyPrefix: "settings" });
  const { data: authUser, isLoading } = useAuthUserQuery();
  const userIsSuperAdmin = isSuperAdmin(authUser?.roles);
  const categories = resolveSettingsCategories(userIsSuperAdmin);

  if (isLoading || !authUser) {
    return <LoadingState className="m-6" />;
  }

  return (
    <div className="w-full min-w-0">
      <div className="space-y-5 px-4 py-6 sm:px-6">
        <div className="space-y-1">
          <Heading pageTitle>{t("title")}</Heading>
          <Paragraph className="text-text-muted">{t("subtitle")}</Paragraph>
        </div>

        {categories.length === 0 ? (
          <StateCard title={t("emptyTitle")} body={t("emptyBody")} />
        ) : (
          <SettingsCategoriesLayout
            categories={categories}
            renderPanel={(categoryId) => {
              if (categoryId === "seo-activities") {
                return <SettingsSeoActivitiesPanel />;
              }
              if (categoryId === "theme") {
                return <SettingsThemePanel />;
              }
              return null;
            }}
          />
        )}
      </div>
    </div>
  );
}
