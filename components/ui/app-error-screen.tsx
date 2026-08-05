"use client";

import Link from "next/link";
import { IoWarningOutline } from "react-icons/io5";

import { AppLogo } from "@/components/layout/app-logo";
import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { Button, buttonVariants } from "@/components/ui/button";
import { elevatedCardSurfaceClass } from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

export type TAppErrorScreenProps = {
  title: string;
  description: string;
  retryLabel: string;
  homeLabel: string;
  homeHref?: string;
  onRetry?: () => void;
  className?: string;
  /** Hide logo — use inside dashboard shell content areas. */
  compact?: boolean;
};

export function AppErrorScreen({
  title,
  description,
  retryLabel,
  homeLabel,
  homeHref = "/",
  onRetry,
  className,
  compact = false,
}: TAppErrorScreenProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center px-4 py-10 sm:py-12",
        !compact && "min-h-svh bg-bg-main",
        className,
      )}
      role="alert"
      aria-live="assertive"
    >
      {!compact ? <AppLogo className="mb-8" priority /> : null}

      <div
        className={cn(
          elevatedCardSurfaceClass,
          "w-full max-w-md rounded-3xl p-6 text-center sm:p-8",
        )}
      >
        <span
          className="mx-auto inline-flex size-12 items-center justify-center rounded-full border border-destructive/35 bg-destructive/12 text-destructive"
          aria-hidden
        >
          <IoWarningOutline className="size-6" />
        </span>

        <div className="mt-6 flex flex-col items-center gap-2.5">
          <Heading sectionTitle className="text-text-primary">
            {title}
          </Heading>
          <Paragraph className="max-w-sm text-text-muted">{description}</Paragraph>
        </div>

        <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
          {onRetry ? (
            <Button type="button" variant="gradient" size="md" onClick={onRetry}>
              {retryLabel}
            </Button>
          ) : null}
          <Link
            href={homeHref}
            className={cn(buttonVariants({ variant: "outlined", size: "md" }), "inline-flex")}
          >
            {homeLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
