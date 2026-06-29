import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-24 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-h)] shadow-xs transition-[color,box-shadow,border-color] outline-none",
        "placeholder:text-[var(--text-muted)]",
        "focus-visible:border-[var(--accent-border)] focus-visible:ring-2 focus-visible:ring-[var(--brand)]/25",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-[color-mix(in_srgb,var(--destructive)_65%,var(--border))] aria-invalid:ring-destructive/20",
        "resize-y",
        className,
      )}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
