"use client";

import { useTranslation } from "react-i18next";

import { FlagSaudiArabia, FlagUnitedKingdom } from "@/components/flag-icons";
import { chromeControlToneClass } from "@/lib/frontend/theme/chrome-tones";
import { cn } from "@/lib/utils";

const sizeClass = {
  default: "h-10 w-10 rounded-xl",
  sm: "h-8 w-8 rounded-lg",
  xs: "h-7 w-7 rounded-lg",
} as const;

const flagClass = {
  default: "h-3.5 w-5 rounded-[2px]",
  sm: "h-3 w-[18px] rounded-[1.5px]",
  xs: "h-2.5 w-4 rounded-[1.5px]",
} as const;

export function LanguageSwitcher({
  tone = "default",
  size = "default",
  className,
}: {
  tone?: keyof typeof chromeControlToneClass;
  size?: keyof typeof sizeClass;
  className?: string;
}) {
  const { i18n, t } = useTranslation("translation", { keyPrefix: "lang" });
  const base = (i18n.resolvedLanguage ?? "en").split(/[-_]/)[0] ?? "en";
  const isArabic = base === "ar";
  const nextLang = isArabic ? "en" : "ar";
  const label = isArabic ? t("switchToEnglish") : t("switchToArabic");

  return (
    <button
      type="button"
      onClick={() => {
        void i18n.changeLanguage(nextLang);
      }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden border transition-[border-color,background-color,transform,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.96]",
        sizeClass[size],
        chromeControlToneClass[tone],
        className
      )}
      aria-label={label}
      title={label}
    >
      {isArabic ? (
        <FlagSaudiArabia className={flagClass[size]} />
      ) : (
        <FlagUnitedKingdom className={flagClass[size]} />
      )}
    </button>
  );
}
