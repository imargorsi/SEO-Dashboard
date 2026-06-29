import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    data-slot="checkbox"
    className={cn(
      "peer size-4 shrink-0 rounded border border-[var(--border)] bg-[var(--bg)] shadow-xs outline-none transition-[border-color,box-shadow,background-color]",
      "focus-visible:border-[var(--accent-border)] focus-visible:ring-2 focus-visible:ring-[var(--brand)]/25",
      "data-[state=checked]:border-[color-mix(in_srgb,var(--brand)_55%,var(--border))] data-[state=checked]:bg-[color-mix(in_srgb,var(--brand)_18%,var(--bg-elevated))] data-[state=checked]:text-[var(--text-h)]",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className="flex items-center justify-center text-current"
    >
      <Check className="size-3 stroke-[2.5]" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
