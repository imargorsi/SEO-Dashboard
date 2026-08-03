"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/** White wordmark — dark surfaces. */
const APP_LOGO_DARK_SRC = "/Logo.svg";
/** Dark wordmark — light surfaces. */
const APP_LOGO_LIGHT_SRC = "/light-logo.svg";
/** Collapsed mark (favicon). */
const APP_LOGO_MARK_SRC = "/favicon.png";

type AppLogoProps = {
  alt?: string;
  className?: string;
  height?: number;
  priority?: boolean;
  /** `full` = wordmark; `mark` = brand icon only (favicon). */
  variant?: "full" | "mark";
  width?: number;
};

/** Intrinsic canvas: wordmark 1131×193 (~5.86:1), mark 193×193. */
const FULL_LOGO_WIDTH = 188;
const FULL_LOGO_HEIGHT = 32;
const MARK_SIZE = 32;

export function AppLogo({
  alt = "",
  className,
  height,
  priority = false,
  variant = "full",
  width,
}: AppLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (variant === "mark") {
    const markWidth = width ?? MARK_SIZE;
    const markHeight = height ?? MARK_SIZE;
    return (
      <Image
        src="/favicon.png"
        alt={alt}
        width={markWidth}
        height={markHeight}
        priority={priority}
        unoptimized
        className={cn(className)}
        aria-hidden={alt ? undefined : true}
      />
    );
  }

  const fullWidth = width ?? FULL_LOGO_WIDTH;
  const fullHeight = height ?? FULL_LOGO_HEIGHT;

  return (
    <>
      {/* Black wordmark — light surfaces */}
      <Image
        src="/crawllex-dark.png"
        alt={alt}
        width={fullWidth}
        height={fullHeight}
        priority={priority}
        className={cn(className, "dark:hidden")}
        aria-hidden={alt ? undefined : true}
      />
      {/* White wordmark — dark surfaces */}
      <Image
        src="/crawllex-light.png"
        alt={alt}
        width={fullWidth}
        height={fullHeight}
        priority={priority}
        className={cn(className, "hidden dark:block")}
        aria-hidden={alt ? undefined : true}
      />
    </>
  );
}
