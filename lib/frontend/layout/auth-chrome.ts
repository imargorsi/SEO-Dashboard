/** Auth layout + form card — frosted glass over video, theme-aware form fill. */

import { formFieldControlClass } from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

/** Shared split-panel column (form + hero). */
export const authFormPanelClass = "relative z-10 flex min-h-0 flex-1 flex-col";
export const authHeroPanelClass = authFormPanelClass;

/**
 * Auth form card over the video background.
 * Translucent `--bg-main` tint + soft lift shadow (no outline) so chroma stays
 * visible. Distinct from `elevatedCardSurfaceClass`. Tokens: `--auth-form-*`.
 */
export const authFormCardSurfaceClass = cn(
  "relative overflow-hidden rounded-2xl border-0 text-text-primary backdrop-blur-xl backdrop-saturate-150",
  "bg-(--auth-form-bg) shadow-(--auth-form-shadow)",
);

/**
 * Auth field controls — transparent fill + table-shell outline (same as dashboard fields).
 */
export const authFieldControlClass = formFieldControlClass;

/**
 * Hero copy on video / dark fallback — always light ink, even in light mode.
 * Important beats Heading/Paragraph `text-text-*` (twMerge does not treat
 * `text-(--auth-hero-fg)` as conflicting with those utilities).
 */
export const authHeroCopyClass = "text-(--auth-hero-fg)!";
export const authHeroMutedClass = "text-(--auth-hero-muted)!";
