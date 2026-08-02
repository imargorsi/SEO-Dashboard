"use client";

import Image from "next/image";

import { useThemePack } from "@/components/providers/theme-pack-provider";
import {
  THEME_PACK_LOGO_REVISION,
  themePackLogoSrc,
} from "@/lib/frontend/theme/theme-packs";
import { cn } from "@/lib/utils";

type AppLogoProps = {
  alt?: string;
  className?: string;
  height?: number;
  priority?: boolean;
  /** `full` = theme wordmark; `mark` = brand icon only (favicon). */
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
  const { themePack } = useThemePack();

  if (variant === "mark") {
    return (
      <Image
        src={`/favicon.png?v=${THEME_PACK_LOGO_REVISION}`}
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

  return (
    <Image
      key={themePack}
      src={themePackLogoSrc(themePack)}
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
