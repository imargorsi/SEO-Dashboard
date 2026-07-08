"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

function IconSun({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function IconMoon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

const toneClass = {
  default:
    "border-[var(--border)] bg-[var(--social-bg)] text-[var(--text-h)] shadow-[var(--shadow)] hover:border-[var(--accent-border)] hover:bg-[var(--accent-bg)] hover:text-[var(--text-h)] focus-visible:ring-[var(--accent-border)] focus-visible:ring-offset-[var(--bg)]",
  inverse:
    "border-0 bg-black/25 text-white shadow-none hover:bg-white/15 hover:text-white focus-visible:ring-white/60 focus-visible:ring-offset-0",
  ghost:
    "border-transparent bg-transparent text-[var(--text-h)]/65 shadow-none hover:bg-[color-mix(in_srgb,var(--text-h)_10%,transparent)] hover:text-[var(--text-h)] dark:text-white/55 dark:hover:bg-white/[0.08] dark:hover:text-white/90 focus-visible:ring-[var(--text-h)]/25 focus-visible:ring-offset-0 dark:focus-visible:ring-white/35",
} as const;

const sizeClass = {
  default: "h-10 w-10 rounded-xl",
  sm: "h-8 w-8 rounded-lg",
  xs: "h-7 w-7 rounded-lg",
} as const;

const iconSizeClass = {
  default: "h-5 w-5",
  sm: "h-4 w-4",
  xs: "h-3.5 w-3.5",
} as const;

export function ThemeToggle({
  tone = "default",
  size = "default",
  className,
}: {
  tone?: keyof typeof toneClass;
  size?: keyof typeof sizeClass;
  className?: string;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useTranslation("translation", { keyPrefix: "theme" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const isDark = resolvedTheme === "dark";
  const label = isDark ? t("switchToLight") : t("switchToDark");
  const iconCls = iconSizeClass[size];

  if (!mounted) {
    return <span className={cn("inline-flex shrink-0", sizeClass[size], className)} aria-hidden />;
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "group relative inline-flex shrink-0 items-center justify-center overflow-hidden border transition-[border-color,background-color,transform,box-shadow,color] duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.96] before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-200 before:bg-gradient-primary",
        sizeClass[size],
        toneClass[tone],
        isDark ? "before:opacity-70" : "before:opacity-0",
        className
      )}
      aria-label={label}
      title={label}
    >
      <span className={cn("relative inline-flex", iconCls)}>
        <span
          className={cn(
            "absolute inset-0 transition-all duration-200",
            isDark ? "opacity-100 translate-y-0 scale-100 rotate-0" : "opacity-0 translate-y-1 scale-75 -rotate-15"
          )}
          aria-hidden
        >
          <IconSun className={iconCls} />
        </span>
        <span
          className={cn(
            "absolute inset-0 transition-all duration-200",
            isDark ? "opacity-0 translate-y-1 scale-75 rotate-15" : "opacity-100 translate-y-0 scale-100 rotate-0"
          )}
          aria-hidden
        >
          <IconMoon className={iconCls} />
        </span>
      </span>
    </button>
  );
}
