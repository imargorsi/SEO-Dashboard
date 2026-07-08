import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-border bg-bg-input px-3 py-2 text-sm text-text-primary shadow-xs transition-[color,box-shadow,border-color] outline-none",
          "placeholder:text-text-placeholder",
          "focus-visible:border-[var(--accent-border)] focus-visible:ring-2 focus-visible:ring-brand/25",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:text-text-disabled",
          "aria-invalid:border-[color-mix(in_srgb,var(--destructive)_65%,var(--border))] aria-invalid:ring-destructive/20",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
