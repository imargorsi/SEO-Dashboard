import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center cursor-pointer justify-center gap-1.5 whitespace-nowrap rounded-xl font-semibold transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:bg-none disabled:bg-[var(--btn-disabled-bg)] disabled:text-[var(--btn-disabled-fg)] disabled:opacity-100 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        gradient:
          "bg-gradient-button text-text-on-brand shadow-xs hover:bg-gradient-button-hover hover:brightness-105",
        default:
          "bg-gradient-button text-text-on-brand shadow-xs hover:bg-gradient-button-hover hover:brightness-105",
        primary:
          "bg-brand text-text-on-brand shadow-xs hover:brightness-105",
        destructive:
          "bg-destructive text-text-on-brand hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outlined:
          "border border-text-on-brand/80 bg-transparent text-text-primary shadow-xs hover:bg-bg-hover",
        outline:
          "border border-border bg-bg-card text-text-primary shadow-xs hover:bg-bg-hover",
        secondary:
          "bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-fg)] hover:bg-[var(--btn-secondary-bg-hover)]",
        ghost: "text-text-primary hover:bg-bg-hover",
        link: "rounded-md text-brand underline-offset-4 hover:underline",
      },
      size: {
        small: "h-8 gap-1 rounded-lg px-3 text-xs has-[>svg]:px-2.5",
        md: "h-9 px-4 py-2 text-sm has-[>svg]:px-3",
        lg: "h-10 px-5 py-2.5 text-sm has-[>svg]:px-4",
        xl: "h-11 px-6 py-3 text-base has-[>svg]:px-5",
        default: "h-9 px-4 py-2 text-sm has-[>svg]:px-3",
        sm: "h-8 gap-1 rounded-lg px-3 text-xs has-[>svg]:px-2.5",
        xs: "h-7 rounded-lg px-2.5 text-[11px] has-[>svg]:px-2",
        icon: "size-9 [&_svg:not([class*='size-'])]:size-4",
        "icon-sm": "size-8 rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>
>(({ className, variant, size, ...props }, ref) => (
  <button
    ref={ref}
    data-slot="button"
    className={cn(buttonVariants({ variant, size }), className)}
    {...props}
  />
));
Button.displayName = "Button";

export { Button, buttonVariants };
