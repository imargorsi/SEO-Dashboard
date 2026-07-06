import * as React from "react";
import { IoChevronForward, IoEllipsisHorizontal } from "react-icons/io5";

import { cn } from "@/lib/utils";
export const breadcrumbLinkClassName = cn(
  "rounded-lg px-2 py-1 font-medium text-[var(--text)] underline-offset-4 transition-[color,background-color] duration-200",
  "hover:bg-[var(--accent-bg)] hover:text-[var(--text-h)] hover:underline",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
);

function Breadcrumb({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="breadcrumb"
      data-slot="breadcrumb"
      className={cn("relative z-[1] min-w-0 flex-1", className)}
      {...props}
    />
  );
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "relative z-[1] flex flex-wrap items-center gap-x-1 gap-y-1.5 break-words text-sm text-[var(--text-h)] sm:gap-x-1.5",
        className
      )}
      {...props}
    />
  );
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  );
}

function BreadcrumbLink({ className, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      data-slot="breadcrumb-link"
      className={cn(breadcrumbLinkClassName, className)}
      {...props}
    />
  );
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      aria-current="page"
      className={cn(
        "inline-flex max-w-[min(100%,18rem)] items-center truncate rounded-lg border border-[var(--border)] bg-[var(--social-bg)] px-2.5 py-1 text-sm font-semibold leading-none text-[var(--text-h)] sm:max-w-md",
        "dark:border-white/35 dark:bg-[rgba(0,0,0,0.22)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
        className
      )}
      {...props}
    />
  );
}

function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn(
        "inline-flex select-none text-[var(--text-muted)] [&>svg]:size-3.5 [&>svg]:shrink-0 [&>svg]:text-[var(--text-muted)]",
        "dark:text-white/45 dark:[&>svg]:text-white/55",
        className
      )}
      {...props}
    >
      {children ?? <IoChevronForward className="rtl:rotate-180" aria-hidden />}
    </li>
  );
}

function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn(
        "flex size-8 items-center justify-center text-[var(--text-muted)] dark:text-white/55",
        className
      )}
      {...props}
    >
      <IoEllipsisHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
