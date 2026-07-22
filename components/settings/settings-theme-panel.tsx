"use client";

import { useTranslation } from "react-i18next";

export function SettingsThemePanel() {
  const { t } = useTranslation("translation", { keyPrefix: "settings.categories" });

  return (
    <div className="rounded-2xl border border-border bg-bg-input/40 px-4 py-5 sm:px-5">
      <p className="type-body text-text-muted">{t("theme")}</p>
    </div>
  );
}
