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

export function AppLogo({
  alt = "",
  className,
  height = 40,
  priority = false,
  variant = "full",
  width = 160,
}: AppLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (variant === "mark") {
    return (
      <Image
        src={APP_LOGO_MARK_SRC}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        unoptimized
        className={cn(className)}
        aria-hidden={alt ? undefined : true}
      />
    );
  }

  const isDark = mounted ? resolvedTheme === "dark" : true;
  const src = isDark ? APP_LOGO_DARK_SRC : APP_LOGO_LIGHT_SRC;

  return (
    <Image
      key={src}
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      unoptimized
      className={cn("object-contain", className)}
      aria-hidden={alt ? undefined : true}
    />
  );
}
