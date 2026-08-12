/** Auth layout + form card — frosted glass over video, theme-aware form fill. */

import { formFieldControlClass } from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

/** Shared split-panel column (form + hero). Centering is applied on the form cell in AuthScreenShell. */
export const authFormPanelClass = "relative z-10 flex min-h-svh flex-1 flex-col lg:h-full lg:min-h-0";
export const authHeroPanelClass = "relative z-10 flex min-h-0 flex-1 flex-col lg:h-full lg:overflow-y-auto";

/** Footer link under Google / submit — consistent breathing room on every auth card. */
export const authFormFooterClass = "mt-12 pt-2 text-center leading-relaxed";

/**
 * Auth form card over the video background.
 * Light: opaque `--bg-main` (no glass wash) so theme text stays readable.
 * Dark: translucent frost via `--auth-form-bg` + blur.
 */
export const authFormCardSurfaceClass = cn(
  "relative overflow-hidden rounded-3xl border-0 text-text-primary",
  "bg-(--auth-form-bg) shadow-(--auth-form-shadow)",
  "dark:backdrop-blur-2xl dark:backdrop-saturate-150",
);

/**
 * Auth field controls — opaque input fill in light mode for contrast over video;
 * transparent outline fields in dark (glass card already dark).
 */
export const authFieldControlClass = cn(
  formFieldControlClass,
  "bg-bg-input dark:bg-transparent",
);

/**
 * Hero copy on video / dark fallback — always light ink, even in light mode.
 * Important beats Heading/Paragraph `text-text-*` (twMerge does not treat
 * `text-(--auth-hero-fg)` as conflicting with those utilities).
 */
export const authHeroCopyClass = "text-(--auth-hero-fg)!";
export const authHeroMutedClass = "text-(--auth-hero-muted)!";

/** Accent span on hero headlines — solid pack brand (no multi-hue CTA gradients). */
export const authHeroAccentClass = "text-brand";

/**
 * Frosted icon well on the dark video hero — light ink, soft white hairline.
 * Not dashboard chrome (those assume page canvas, not photography).
 */
export const authHeroIconWellClass = cn(
  "inline-flex size-10 shrink-0 items-center justify-center rounded-xl",
  "border border-white/20 bg-white/10 text-(--auth-hero-fg)",
  "shadow-sm backdrop-blur-md",
);
