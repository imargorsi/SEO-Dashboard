"use client";

import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

function IconSwitchToArabic({
  className,
  compact,
  extraCompact,
}: {
  className?: string
  compact?: boolean
  extraCompact?: boolean
}) {
  const fontSize = extraCompact ? "10px" : compact ? "12px" : "15px"
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden
    >
      <text
        x="16"
        y="22"
        textAnchor="middle"
        style={{
          fontSize,
          fontWeight: 600,
          fontFamily:
            'system-ui, "Segoe UI", Tahoma, "Noto Naskh Arabic", "Arial Unicode MS", sans-serif',
        }}
      >
        ع
      </text>
    </svg>
  )
}

function IconSwitchToEnglish({
  className,
  compact,
  extraCompact,
}: {
  className?: string
  compact?: boolean
  extraCompact?: boolean
}) {
  const fontSize = extraCompact ? "8px" : compact ? "9px" : "11px"
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden
    >
      <text
        x="16"
        y="21"
        textAnchor="middle"
        style={{
          fontSize,
          fontWeight: 700,
          fontFamily:
            'ui-sans-serif, system-ui, "Segoe UI", Roboto, sans-serif',
          letterSpacing: "-0.02em",
        }}
      >
        EN
      </text>
    </svg>
  )
}

const toneClass = {
  default:
    "border-[var(--border)] bg-[var(--social-bg)] text-[var(--text-h)] shadow-[var(--shadow)] hover:border-[var(--accent-border)] hover:bg-[var(--accent-bg)] hover:text-[var(--text-h)] focus-visible:ring-[var(--accent-border)] focus-visible:ring-offset-[var(--bg)]",
  inverse:
    "border-0 bg-black/25 text-white shadow-none hover:bg-white/15 hover:text-white focus-visible:ring-white/60 focus-visible:ring-offset-0",
  ghost:
    "border-transparent bg-transparent text-[var(--text-h)]/65 shadow-none hover:bg-[color-mix(in_srgb,var(--text-h)_10%,transparent)] hover:text-[var(--text-h)] dark:text-white/55 dark:hover:bg-white/[0.08] dark:hover:text-white/90 focus-visible:ring-[var(--text-h)]/25 focus-visible:ring-offset-0 dark:focus-visible:ring-white/35",
} as const

const sizeClass = {
  default: "h-10 w-10 rounded-xl",
  sm: "h-8 w-8 rounded-lg",
  xs: "h-7 w-7 rounded-lg",
} as const

const langIconWrap = {
  default: "h-7 w-7",
  sm: "h-6 w-6",
  xs: "h-5 w-5",
} as const

export function LanguageSwitcher({
  tone = "default",
  size = "default",
  className,
}: {
  tone?: keyof typeof toneClass
  size?: keyof typeof sizeClass
  className?: string
}) {
  const { i18n, t } = useTranslation("translation", { keyPrefix: "lang" })
  const base = (i18n.resolvedLanguage ?? "en").split(/[-_]/)[0] ?? "en"
  const isArabic = base === "ar"
  const nextLang = isArabic ? "en" : "ar"
  const label = isArabic ? t("switchToEnglish") : t("switchToArabic")
  const compact = size === "sm" || size === "xs"
  const extraCompact = size === "xs"

  return (
    <button
      type="button"
      onClick={() => {
        void i18n.changeLanguage(nextLang)
      }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center border transition-[border-color,background-color,transform,box-shadow,color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.96]",
        sizeClass[size],
        toneClass[tone],
        className,
      )}
      aria-label={label}
      title={label}
    >
      {isArabic ? (
        <IconSwitchToEnglish
          className={langIconWrap[size]}
          compact={compact}
          extraCompact={extraCompact}
        />
      ) : (
        <IconSwitchToArabic
          className={langIconWrap[size]}
          compact={compact}
          extraCompact={extraCompact}
        />
      )}
    </button>
  )
}
