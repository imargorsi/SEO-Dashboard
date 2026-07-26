"use client";

import { useTranslation } from "react-i18next";

import { useFontPack } from "@/components/providers/font-pack-provider";
import { useThemePack } from "@/components/providers/theme-pack-provider";
import { FONT_PACKS, type TFontPackId } from "@/lib/frontend/theme/font-packs";
import { THEME_PACKS, type TThemePackId } from "@/lib/frontend/theme/theme-packs";
import { cn } from "@/lib/utils";

export function SettingsThemePanel() {
  const { t: tTheme } = useTranslation("translation", { keyPrefix: "settings.themePacks" });
  const { t: tFont } = useTranslation("translation", { keyPrefix: "settings.fontPacks" });
  const { themePack, setThemePack } = useThemePack();
  const { fontPack, setFontPack } = useFontPack();

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-8">
        <div className="space-y-2">
          <h3 className="type-title text-text-primary">{tTheme("sectionTitle")}</h3>
          <p className="type-body max-w-2xl text-text-muted">{tTheme("lead")}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
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
                onSelect={() => setThemePack(pack.id)}
              />
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <div className="space-y-2">
          <h3 className="type-title text-text-primary">{tFont("sectionTitle")}</h3>
          <p className="type-body max-w-2xl text-text-muted">{tFont("lead")}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
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
                onSelect={() => setFontPack(pack.id)}
              />
            );
          })}
        </div>
      </section>
    </div>
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
        "flex w-full flex-col gap-6 rounded-2xl border px-6 py-6 text-start transition-[border-color,background-color,box-shadow] duration-200 sm:px-7 sm:py-7",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-border) focus-visible:ring-offset-2 focus-visible:ring-offset-bg-card",
        isSelected
          ? "border-brand bg-bg-selected shadow-(--shadow-elevated)"
          : "border-border bg-bg-input/40 hover:border-accent-border hover:bg-bg-hover",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2.5">
          <p className="type-body-strong text-text-primary">{title}</p>
          <p className="type-caption leading-relaxed text-text-muted">{description}</p>
        </div>
        {isSelected ? (
          <span className="shrink-0 rounded-lg border border-brand/35 bg-brand/12 px-2.5 py-1 type-caption-xs text-brand">
            {selectedLabel}
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-3 pt-1" aria-hidden>
        {swatches.map((hex) => (
          <span
            key={hex}
            className="size-8 rounded-full border border-border shadow-(--shadow)"
            style={{ backgroundColor: hex }}
          />
        ))}
      </div>
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
        "flex w-full flex-col gap-6 rounded-2xl border px-6 py-6 text-start transition-[border-color,background-color,box-shadow] duration-200 sm:px-7 sm:py-7",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-border) focus-visible:ring-offset-2 focus-visible:ring-offset-bg-card",
        isSelected
          ? "border-brand bg-bg-selected shadow-(--shadow-elevated)"
          : "border-border bg-bg-input/40 hover:border-accent-border hover:bg-bg-hover",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2.5">
          <p className="type-body-strong text-text-primary">{title}</p>
          <p className="type-caption leading-relaxed text-text-muted">{description}</p>
        </div>
        {isSelected ? (
          <span className="shrink-0 rounded-lg border border-brand/35 bg-brand/12 px-2.5 py-1 type-caption-xs text-brand">
            {selectedLabel}
          </span>
        ) : null}
      </div>

      <p
        className="truncate type-h2 text-text-primary"
        style={{ fontFamily: `var(${cssVariable})` }}
        aria-hidden
      >
        {sample}
      </p>
    </button>
  );
}
