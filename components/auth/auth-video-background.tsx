"use client";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion.hook";
import { cn } from "@/lib/utils";

type AuthVideoBackgroundProps = {
  /**
   * `fill` — covers the parent (auth page shell).
   * `viewport` — full-viewport video clipped inside a split reveal panel.
   */
  variant?: "fill" | "viewport";
  /** Which viewport edge to anchor when `variant="viewport"`. */
  anchor?: "start" | "end";
};

/**
 * Always-dark photography stand-in when video is disabled (reduced motion).
 * Must stay dark so hero white ink + `AppLogo surface="onDark"` remain readable
 * even when the page theme is light.
 */
function AuthFallbackBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 bg-(--auth-fallback-bg)"
      aria-hidden
    />
  );
}

export function AuthVideoBackground({ variant = "fill", anchor = "start" }: AuthVideoBackgroundProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <AuthFallbackBackground />;
  }

  const video = (
    <video
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      className="absolute inset-0 h-full w-full object-cover object-center"
    >
      <source src="/auth-bg.mp4" type="video/mp4" />
    </video>
  );

  if (variant === "viewport") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className={cn(
            "absolute top-0 h-svh w-svw max-w-none",
            anchor === "end" ? "inset-e-0" : "inset-s-0",
          )}
        >
          {video}
          <div className="absolute inset-0 bg-(--auth-video-scrim)" />
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {video}
      <div className="absolute inset-0 bg-(--auth-video-scrim)" />
    </div>
  );
}
