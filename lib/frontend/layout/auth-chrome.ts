/** Auth layout + form card — frosted glass aligned with dashboard elevated panels. */

import { elevatedCardSurfaceClass } from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

export const authFormPanelClass = "relative z-10 flex min-h-0 flex-1 flex-col";

export const authHeroPanelClass = "relative z-10 flex min-h-0 flex-1 flex-col";

/** Same glass language as dashboard cards — no brand top stripe. */
export const authFormCardSurfaceClass = cn(
  "relative overflow-hidden rounded-2xl",
  elevatedCardSurfaceClass,
);

/**
 * Auth field controls — translucent theme surfaces (not opaque `--bg-input` slabs).
 * Matches active pack light/dark tokens over the glass card + video.
 */
export const authFieldControlClass =
  "border-border/55 bg-bg-main/50 shadow-none backdrop-blur-md backdrop-saturate-150 dark:border-text-primary/25 dark:bg-text-primary/[0.07]";

/** Hero copy sits on the video — stay light regardless of page theme. */
export const authHeroCopyClass = "text-(--auth-hero-fg)";
