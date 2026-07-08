import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-0.5 overflow-hidden whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:size-2.5 [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-gradient-button text-text-on-brand [a&]:hover:brightness-105",
        secondary:
          "border-transparent bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-fg)] [a&]:hover:bg-[var(--btn-secondary-bg-hover)]",
        outline: "border-border bg-bg-hover text-text-primary",
        success: "border-success/35 bg-success/12 text-success",
        muted: "border-transparent bg-muted text-muted-foreground [a&]:hover:bg-muted/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
