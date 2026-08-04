/** Auth layout + form card — frosted glass aligned with dashboard elevated panels. */

import { elevatedCardSurfaceClass, formFieldControlClass } from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

export const authFormPanelClass = "relative z-10 flex min-h-0 flex-1 flex-col";

export const authHeroPanelClass = "relative z-10 flex min-h-0 flex-1 flex-col";

/** Same glass language as dashboard cards — no brand top stripe. */
export const authFormCardSurfaceClass = cn(
  "relative overflow-hidden rounded-2xl",
  elevatedCardSurfaceClass,
);

/**
 * Auth field controls — transparent fill + table-shell outline (same as dashboard fields).
 */
export const authFieldControlClass = formFieldControlClass;

/** Hero copy sits on the video — stay light regardless of page theme. */
export const authHeroCopyClass = "text-(--auth-hero-fg)";
