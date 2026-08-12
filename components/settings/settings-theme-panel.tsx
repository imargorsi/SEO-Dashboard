"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { IoCheckmarkCircle } from "react-icons/io5";

import { useFontPack } from "@/components/providers/font-pack-provider";
import { useThemePack } from "@/components/providers/theme-pack-provider";
import { useUpdateUserPreferencesMutation } from "@/features/preferences/preferences.api";
import { ApiError } from "@/lib/frontend/api/errors";
import { notify } from "@/lib/frontend/feedback/notify";
import {
  settingsInsetDividerClass,
  typeStackMdClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import { FONT_PACKS, type TFontPackId } from "@/lib/frontend/theme/font-packs";
import { THEME_PACKS, type TThemePackId } from "@/lib/frontend/theme/theme-packs";
import { cn } from "@/lib/utils";

export function SettingsThemePanel() {
  const { t: tTheme } = useTranslation("translation", { keyPrefix: "settings.themePacks" });
  const { t: tFont } = useTranslation("translation", { keyPrefix: "settings.fontPacks" });
  const { themePack } = useThemePack();
  const { fontPack } = useFontPack();
  const updatePreferences = useUpdateUserPreferencesMutation();
  const isBusy = updatePreferences.isPending;

  function handleThemeSelect(packId: TThemePackId) {
    if (isBusy || packId === themePack) return;
    updatePreferences.mutate(
      { theme_pack: packId },
      {
        onError: (error) => {
          notify.error(ApiError.messageFrom(error, tTheme("saveErrorFallback")));
        },
      },
    );
  }

  function handleFontSelect(packId: TFontPackId) {
    if (isBusy || packId === fontPack) return;
    updatePreferences.mutate(
      { font_pack: packId },
      {
        onError: (error) => {
          notify.error(ApiError.messageFrom(error, tFont("saveErrorFallback")));
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PreferenceSection title={tTheme("sectionTitle")} lead={tTheme("lead")}>
        <div className="grid gap-2 sm:grid-cols-2">
          {THEME_PACKS.map((pack) => (
            <ThemePackCard
              key={pack.id}
              packId={pack.id}
              title={tTheme(pack.nameKey)}
              description={tTheme(pack.descriptionKey)}
              swatches={pack.swatches}
              isSelected={themePack === pack.id}
              selectedLabel={tTheme("selected")}
              disabled={isBusy}
              onSelect={() => handleThemeSelect(pack.id)}
            />
          ))}
        </div>
      </PreferenceSection>

      <div className={settingsInsetDividerClass} aria-hidden />

      <PreferenceSection title={tFont("sectionTitle")} lead={tFont("lead")}>
        <div className="grid gap-2 sm:grid-cols-2">
          {FONT_PACKS.map((pack) => (
            <FontPackCard
              key={pack.id}
              packId={pack.id}
              title={tFont(pack.nameKey)}
              description={tFont(pack.descriptionKey)}
              sample={pack.sample}
              cssVariable={pack.cssVariable}
              isSelected={fontPack === pack.id}
              selectedLabel={tFont("selected")}
              disabled={isBusy}
              onSelect={() => handleFontSelect(pack.id)}
            />
          ))}
        </div>
      </PreferenceSection>
    </div>
  );
}

function PreferenceSection({
  title,
  lead,
  children,
}: {
  title: string;
  lead: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2.5">
      <div className={typeStackMdClass}>
        <h3 className="type-title text-text-primary">{title}</h3>
        <p className="type-caption max-w-2xl text-text-muted">{lead}</p>
      </div>
      {children}
    </section>
  );
}

const preferenceCardClass = cn(
  "flex w-full flex-col gap-0.5 rounded-xl border px-3 py-2.5 text-start",
  "transition-[border-color,background-color,box-shadow,opacity] duration-200",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-border)",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-bg-card",
  "disabled:pointer-events-none disabled:opacity-60",
);

function preferenceCardStateClass(isSelected: boolean) {
  return isSelected
    ? "border-brand/55 bg-bg-selected shadow-sm"
    : "border-border/50 bg-transparent hover:border-border hover:bg-bg-hover/45 dark:border-text-primary/15 dark:hover:border-text-primary/28";
}

function ThemePackCard({
  packId,
  title,
  description,
  swatches,
  isSelected,
  selectedLabel,
  disabled,
  onSelect,
}: {
  packId: TThemePackId;
  title: string;
  description: string;
  swatches: readonly [string, string, string];
  isSelected: boolean;
  selectedLabel: string;
  disabled?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={isSelected}
      aria-label={isSelected ? `${title}. ${selectedLabel}` : title}
      data-theme-pack={packId}
      className={cn(preferenceCardClass, preferenceCardStateClass(isSelected))}
    >
      <div className="flex items-center gap-2">
        <div className="flex shrink-0 items-center" aria-hidden>
          {swatches.map((hex, index) => (
            <span
              key={hex}
              className={cn(
                "size-3.5 rounded-full border border-border/50 dark:border-text-primary/25",
                index > 0 && "-ms-1",
              )}
              style={{ backgroundColor: hex, zIndex: swatches.length - index }}
            />
          ))}
        </div>
        <p className="min-w-0 flex-1 truncate type-label text-text-primary">{title}</p>
        {isSelected ? (
          <IoCheckmarkCircle className="size-3.5 shrink-0 text-brand" aria-hidden />
        ) : null}
      </div>
      <p className="truncate type-caption text-text-muted">{description}</p>
    </button>
  );
}

function FontPackCard({
  packId,
  title,
  description,
  sample,
  cssVariable,
  isSelected,
  selectedLabel,
  disabled,
  onSelect,
}: {
  packId: TFontPackId;
  title: string;
  description: string;
  sample: string;
  cssVariable: string;
  isSelected: boolean;
  selectedLabel: string;
  disabled?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={isSelected}
      aria-label={isSelected ? `${title}. ${selectedLabel}` : title}
      data-font-pack={packId}
      className={cn(preferenceCardClass, preferenceCardStateClass(isSelected))}
    >
      <div className="flex items-center gap-2">
        <p className="min-w-0 flex-1 truncate type-label text-text-primary">{title}</p>
        <p
          className="shrink-0 type-caption text-text-secondary"
          style={{ fontFamily: `var(${cssVariable})` }}
          aria-hidden
        >
          {sample}
        </p>
        {isSelected ? (
          <IoCheckmarkCircle className="size-3.5 shrink-0 text-brand" aria-hidden />
        ) : null}
      </div>
      <p className="truncate type-caption text-text-muted">{description}</p>
    </button>
  );
}
