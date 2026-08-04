"use client";

import { useTranslation } from "react-i18next";

import { useFontPack } from "@/components/providers/font-pack-provider";
import { useThemePack } from "@/components/providers/theme-pack-provider";
import { useUpdateUserPreferencesMutation } from "@/features/preferences/preferences.api";
import { ApiError } from "@/lib/frontend/api/errors";
import { notify } from "@/lib/frontend/feedback/notify";
import { FONT_PACKS, type TFontPackId } from "@/lib/frontend/theme/font-packs";
import { THEME_PACKS, type TThemePackId } from "@/lib/frontend/theme/theme-packs";
import { cn } from "@/lib/utils";

export function SettingsThemePanel() {
  const { t: tTheme } = useTranslation("translation", { keyPrefix: "settings.themePacks" });
  const { t: tFont } = useTranslation("translation", { keyPrefix: "settings.fontPacks" });
  const { themePack } = useThemePack();
  const { fontPack } = useFontPack();
  const updatePreferences = useUpdateUserPreferencesMutation();

  function handleThemeSelect(packId: TThemePackId) {
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
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="type-title text-text-primary">{tTheme("sectionTitle")}</h3>
          <p className="type-caption max-w-2xl text-text-muted">{tTheme("lead")}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {THEME_PACKS.map((pack) => {
            const isSelected = themePack === pack.id;
            return (
              <ThemePackCard
                key={pack.id}
                packId={pack.id}
                title={tTheme(pack.nameKey)}
                description={tTheme(pack.descriptionKey)}
                swatches={pack.swatches}
                isSelected={isSelected}
                selectedLabel={tTheme("selected")}
                onSelect={() => handleThemeSelect(pack.id)}
              />
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="type-title text-text-primary">{tFont("sectionTitle")}</h3>
          <p className="type-caption max-w-2xl text-text-muted">{tFont("lead")}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {FONT_PACKS.map((pack) => {
            const isSelected = fontPack === pack.id;
            return (
              <FontPackCard
                key={pack.id}
                packId={pack.id}
                title={tFont(pack.nameKey)}
                description={tFont(pack.descriptionKey)}
                sample={pack.sample}
                cssVariable={pack.cssVariable}
                isSelected={isSelected}
                selectedLabel={tFont("selected")}
                onSelect={() => handleFontSelect(pack.id)}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SelectedBadge({ label }: { label: string }) {
  return (
    <span className="shrink-0 rounded-md border border-brand/35 bg-brand/12 px-2 py-0.5 type-caption-xs text-brand">
      {label}
    </span>
  );
}

function ThemePackCard({
  packId,
  title,
  description,
  swatches,
  isSelected,
  selectedLabel,
  onSelect,
}: {
  packId: TThemePackId;
  title: string;
  description: string;
  swatches: readonly [string, string, string];
  isSelected: boolean;
  selectedLabel: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      data-theme-pack={packId}
      className={cn(
        "flex w-full flex-col gap-1.5 rounded-xl border px-3.5 py-3 text-start transition-[border-color,background-color,box-shadow] duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-border) focus-visible:ring-offset-2 focus-visible:ring-offset-bg-card",
        isSelected
          ? "border-brand bg-bg-selected shadow-(--shadow-elevated)"
          : "border-border bg-bg-input/40 hover:border-accent-border hover:bg-bg-hover",
      )}
    >
      <div className="flex items-center gap-2.5">
        <p className="min-w-0 flex-1 truncate type-label text-text-primary">{title}</p>
        <div className="flex shrink-0 items-center gap-1.5" aria-hidden>
          {swatches.map((hex) => (
            <span
              key={hex}
              className="size-5 rounded-full border border-border shadow-(--shadow)"
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
        {isSelected ? <SelectedBadge label={selectedLabel} /> : null}
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
  onSelect,
}: {
  packId: TFontPackId;
  title: string;
  description: string;
  sample: string;
  cssVariable: string;
  isSelected: boolean;
  selectedLabel: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      data-font-pack={packId}
      className={cn(
        "flex w-full flex-col gap-1.5 rounded-xl border px-3.5 py-3 text-start transition-[border-color,background-color,box-shadow] duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-border) focus-visible:ring-offset-2 focus-visible:ring-offset-bg-card",
        isSelected
          ? "border-brand bg-bg-selected shadow-(--shadow-elevated)"
          : "border-border bg-bg-input/40 hover:border-accent-border hover:bg-bg-hover",
      )}
    >
      <div className="flex items-center gap-2.5">
        <p className="min-w-0 flex-1 truncate type-label text-text-primary">{title}</p>
        <p
          className="shrink-0 type-body-strong text-text-primary"
          style={{ fontFamily: `var(${cssVariable})` }}
          aria-hidden
        >
          {sample}
        </p>
        {isSelected ? <SelectedBadge label={selectedLabel} /> : null}
      </div>
      <p className="truncate type-caption text-text-muted">{description}</p>
    </button>
  );
}
