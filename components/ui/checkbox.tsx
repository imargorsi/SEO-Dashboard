import * as React from "react";
import { IoCheckmark } from "react-icons/io5";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, checked, ...props }, ref) => (
    <span className="relative inline-flex size-4 shrink-0 items-center justify-center">
      <input
        ref={ref}
        type="checkbox"
        data-slot="checkbox"
        checked={checked}
        className={cn(
          "peer size-4 shrink-0 appearance-none rounded border border-border bg-bg-input shadow-xs outline-none transition-[border-color,box-shadow,background-color]",
          "focus-visible:border-[var(--accent-border)] focus-visible:ring-2 focus-visible:ring-brand/25",
          "checked:border-[color-mix(in_srgb,var(--brand)_55%,var(--border))] checked:bg-bg-selected",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
      <IoCheckmark
        className="pointer-events-none absolute size-3 text-text-primary opacity-0 peer-checked:opacity-100"
        aria-hidden
      />
    </span>
  )
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
