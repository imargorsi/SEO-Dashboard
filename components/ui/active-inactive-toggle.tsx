"use client";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type TActiveInactiveToggleProps = {
  /** `true` = Active (green), `false` = Inactive (red). */
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  isLoading?: boolean;
  ariaLabel: string;
  /** Optional title shown above the toggle. */
  label?: string;
  size?: "sm" | "md";
  className?: string;
};

const SIZE_CLASSES = {
  sm: {
    track: "h-5 w-9",
    thumb: "size-4",
    translate: "translate-x-4",
    spinner: "size-3",
  },
  md: {
    track: "h-7 w-12",
    thumb: "size-6",
    translate: "translate-x-5",
    spinner: "size-3.5",
  },
} as const;

export function ActiveInactiveToggle({
  checked,
  onCheckedChange,
  disabled = false,
  isLoading = false,
  ariaLabel,
  label,
  size = "sm",
  className,
}: TActiveInactiveToggleProps) {
  const sizes = SIZE_CLASSES[size];
  const isDisabled = disabled || isLoading;

  const toggle = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={isDisabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ease-out",
        "focus-visible:ring-2 focus-visible:ring-accent-border focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-60",
        checked ? "bg-status-active" : "bg-status-rejected",
        sizes.track,
        !label && className,
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-flex items-center justify-center rounded-full bg-text-on-brand shadow-sm transition-transform duration-200 ease-out",
          sizes.thumb,
          checked ? sizes.translate : "translate-x-0",
        )}
        aria-hidden
      >
        {isLoading ? <Spinner className={cn(sizes.spinner, "text-text-muted")} /> : null}
      </span>
    </button>
  );

  if (!label) return toggle;

  return (
    <div className={cn("inline-flex flex-col items-center gap-1.5", className)}>
      <span className="type-caption-xs font-semibold uppercase tracking-[0.08em] text-text-muted">{label}</span>
      {toggle}
    </div>
  );
}
