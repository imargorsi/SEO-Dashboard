"use client";

import { useTranslation } from "react-i18next";

import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { SettingsCategoriesLayout } from "@/components/settings/settings-categories-layout";
import { SettingsIntegrationsPanel } from "@/components/settings/settings-integrations-panel";
import { SettingsThemePanel } from "@/components/settings/settings-theme-panel";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { resolveSettingsCategories } from "@/lib/frontend/settings/categories";
import { isSuperAdmin } from "@/lib/rbac/access";

export function SettingsSection() {
  const { t } = useTranslation("translation", { keyPrefix: "settings" });
  const { data: authUser, isLoading } = useAuthUserQuery();
  const userIsSuperAdmin = isSuperAdmin(authUser?.roles);
  const categories = resolveSettingsCategories(userIsSuperAdmin);

  if (isLoading || !authUser) {
    return <LoadingState skeletonVariant="settings" />;
  }

  return (
    <div className="w-full min-w-0">
      <div className="space-y-5 px-4 py-6 sm:px-6">
        <div className="space-y-1">
          <Heading pageTitle>{t("title")}</Heading>
          <Paragraph className="text-text-muted">{t("subtitle")}</Paragraph>
        </div>

        {categories.length === 0 ? (
          <EmptyState title={t("emptyTitle")} description={t("emptyBody")} />
        ) : (
          <SettingsCategoriesLayout
            categories={categories}
            renderPanel={(categoryId) => {
              if (categoryId === "theme") {
                return <SettingsThemePanel />;
              }
              if (categoryId === "integrations") {
                return <SettingsIntegrationsPanel />;
              }
              return null;
            }}
          />
        )}
      </div>
    </div>
  );
}
