import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"


export const breadcrumbBarShellClassName = cn(
  "relative isolate w-full max-w-none overflow-hidden rounded-none border-x-0 border-t-0 border-b",
  "border-[var(--border)] bg-[color-mix(in_srgb,var(--social-bg)_88%,var(--brand)_10%)]",
  "dark:border-white/12 dark:bg-[linear-gradient(102deg,color-mix(in_srgb,var(--brand)_60%,#312e81)_0%,color-mix(in_srgb,#57534e_78%,var(--text-h))_45%,color-mix(in_srgb,#ca8a04_50%,#713f12)_100%)]",
)

export function BreadcrumbBarShell({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="breadcrumb-bar-shell"
      className={cn(breadcrumbBarShellClassName, className)}
      {...props}
    />
  )
}

function Breadcrumb({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="breadcrumb"
      data-slot="breadcrumb"
      className={cn("relative z-[1] min-w-0 flex-1", className)}
      {...props}
    />
  )
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "relative z-[1] flex flex-wrap items-center gap-x-1 gap-y-1.5 break-words text-sm text-[var(--text-h)] sm:gap-x-1.5",
        "dark:text-white/95",
        className,
      )}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  )
}

function BreadcrumbLink({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"a"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn(
        "rounded-lg px-2 py-1 font-medium text-[var(--text)] underline-offset-4 backdrop-blur-[2px] transition-[color,transform,box-shadow,background-color] duration-200",
        "hover:bg-[var(--accent-bg)] hover:text-[var(--text-h)] hover:underline",
        "active:translate-y-px active:shadow-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
        "dark:text-white/90 dark:hover:bg-white/15 dark:hover:text-white dark:focus-visible:ring-white/60 dark:focus-visible:ring-offset-transparent",
        className,
      )}
      {...props}
    />
  )
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      aria-current="page"
      className={cn(
        "inline-flex max-w-[min(100%,18rem)] items-center truncate rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-1 font-semibold text-[var(--text-h)] shadow-sm sm:max-w-md",
        "dark:border-white/35 dark:bg-[rgba(0,0,0,0.22)] dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_14px_rgba(0,0,0,0.35)]",
        className,
      )}
      {...props}
    />
  )
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn(
        "inline-flex select-none text-[var(--text-muted)] [&>svg]:size-3.5 [&>svg]:shrink-0 [&>svg]:text-[var(--text-muted)]",
        "dark:text-white/45 dark:[&>svg]:text-white/55",
        className,
      )}
      {...props}
    >
      {children ?? (
        <ChevronRight className="rtl:rotate-180" strokeWidth={2.25} aria-hidden />
      )}
    </li>
  )
}

function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-8 items-center justify-center text-[var(--text-muted)] dark:text-white/55", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
