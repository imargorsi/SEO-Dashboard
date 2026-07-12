"use client";

import { Spinner } from "@/components/ui/spinner";
import { elevatedCardSurfaceClass } from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

type LoadingStateProps = {
  label?: string;
  className?: string;
  /** `card` — bordered surface for section content; `inline` — spinner row only */
  variant?: "card" | "inline";
};

export function LoadingState({
  label = "Loading…",
  className,
  variant = "card",
}: LoadingStateProps) {
  const content = (
    <div
      className="flex items-center justify-center gap-2 type-body text-(--text-on-elevated-muted)"
      role="status"
      aria-live="polite"
    >
      <Spinner className="size-4 shrink-0" />
      <span>{label}</span>
    </div>
  );

  if (variant === "inline") {
    return <div className={className}>{content}</div>;
  }

  return (
    <div
      className={cn(elevatedCardSurfaceClass, "rounded-2xl px-4 py-8 text-center", className)}
    >
      {content}
    </div>
  );
}
