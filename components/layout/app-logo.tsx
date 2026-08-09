import Image from "next/image";

import { cn } from "@/lib/utils";

type AppLogoProps = {
  alt?: string;
  className?: string;
  height?: number;
  priority?: boolean;
  /** `full` = wordmark; `mark` = brand icon only (favicon). */
  variant?: "full" | "mark";
  /**
   * `auto` — follow light/dark class.
   * `onDark` — always light wordmark (video / dark photography).
   * `onLight` — always dark wordmark.
   */
  surface?: "auto" | "onDark" | "onLight";
  width?: number;
};

/** Intrinsic canvas: wordmark 951×186 (~5.11:1), mark 193×193. */
const FULL_LOGO_WIDTH = 188;
const FULL_LOGO_HEIGHT = 37;
const MARK_SIZE = 32;

export function AppLogo({
  alt = "",
  className,
  height,
  priority = false,
  variant = "full",
  surface = "auto",
  width,
}: AppLogoProps) {
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
        className={cn("block", className)}
        aria-hidden={alt ? undefined : true}
      />
    );
  }

  const fullWidth = width ?? FULL_LOGO_WIDTH;
  const fullHeight = height ?? FULL_LOGO_HEIGHT;

  if (surface === "onDark") {
    return (
      <Image
        src="/crawllex-light.png"
        alt={alt}
        width={fullWidth}
        height={fullHeight}
        priority={priority}
        className={cn("block h-auto max-h-full w-auto max-w-full", className)}
        aria-hidden={alt ? undefined : true}
      />
    );
  }

  if (surface === "onLight") {
    return (
      <Image
        src="/crawllex-dark.png"
        alt={alt}
        width={fullWidth}
        height={fullHeight}
        priority={priority}
        className={cn("block h-auto max-h-full w-auto max-w-full", className)}
        aria-hidden={alt ? undefined : true}
      />
    );
  }

  return (
    <span
      className={cn("relative inline-block shrink-0", className)}
      style={{ width: fullWidth, height: fullHeight }}
    >
      {/* Black wordmark — light surfaces */}
      <Image
        src="/crawllex-dark.png"
        alt={alt}
        width={fullWidth}
        height={fullHeight}
        priority={priority}
        className="absolute inset-0 block h-full w-full object-contain dark:hidden"
        aria-hidden={alt ? undefined : true}
      />
      {/* White wordmark — dark surfaces */}
      <Image
        src="/crawllex-light.png"
        alt={alt}
        width={fullWidth}
        height={fullHeight}
        priority={priority}
        className="absolute inset-0 hidden h-full w-full object-contain dark:block"
        aria-hidden={alt ? undefined : true}
      />
    </span>
  );
}
