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
 * Auth field controls — same glass input language as dashboard fields.
 * Extra blur helps over the video backdrop.
 */
export const authFieldControlClass =
  "border-border/55 bg-bg-input shadow-none backdrop-blur-md backdrop-saturate-150 dark:border-text-primary/25";

/** Hero copy sits on the video — stay light regardless of page theme. */
export const authHeroCopyClass = "text-(--auth-hero-fg)";
