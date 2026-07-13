"use client";

import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

const sizeClass = {
  default: "h-8 min-w-6 rounded-md px-2",
  sm: "h-7 min-w-10 rounded px-2.5",
  xs: "h-6 min-w-9 rounded px-2",
} as const;

const labelClass = {
  default: "type-caption-xs",
  sm: "type-caption-xs",
  xs: "text-[10px] font-semibold leading-none",
} as const;

export function LanguageSwitcher({
  size = "default",
  className,
}: {
  /** @deprecated Tone is ignored — language pill always uses brand border. */
  tone?: "default" | "inverse" | "ghost";
  size?: keyof typeof sizeClass;
  className?: string;
}) {
  const { i18n, t } = useTranslation("translation", { keyPrefix: "lang" });
  const current = (i18n.resolvedLanguage ?? "en").split(/[-_]/)[0] ?? "en";
  const isArabic = current === "ar";
  const nextLang = isArabic ? "en" : "ar";
  const label = isArabic ? t("switchToEnglish") : t("switchToArabic");
  const displayLang = nextLang.toUpperCase();

  return (
    <button
      type="button"
      onClick={() => {
        void i18n.changeLanguage(nextLang);
      }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center border border-brand bg-transparent font-semibold uppercase tracking-wide text-brand transition-[color,background-color,transform] duration-200 hover:bg-bg-hover focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg-card focus-visible:outline-none active:scale-[0.96]",
        sizeClass[size],
        labelClass[size],
        className,
      )}
      aria-label={label}
      title={label}
    >
      {displayLang}
    </button>
  );
}
