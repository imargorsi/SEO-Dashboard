"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { Icons } from "@/lib/frontend/icons/app-icons";
import { cn } from "@/lib/utils";

type TCreateActionButtonBase = {
  children: ReactNode;
  className?: string;
};

type TCreateActionButtonAsLink = TCreateActionButtonBase & {
  href: string;
  onClick?: never;
  type?: never;
  disabled?: never;
};

type TCreateActionButtonAsButton = TCreateActionButtonBase & {
  href?: undefined;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
};

export type TCreateActionButtonProps = TCreateActionButtonAsLink | TCreateActionButtonAsButton;

const createActionSurfaceClass = cn(
  "group relative inline-flex h-10 shrink-0 items-center justify-center gap-2",
  "rounded-full px-4 type-label font-semibold tracking-tight text-text-on-brand",
  "bg-brand shadow-xs hover:bg-brand/90",
  "transition-[transform,background-color] duration-200 ease-out",
  "active:scale-[0.985]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:ring-offset-2 focus-visible:ring-offset-bg-main",
  "disabled:pointer-events-none disabled:opacity-55",
);

function CreateActionContent({ children }: { children: ReactNode }) {
  return (
    <>
      <span
        className={cn(
          "relative z-10 inline-flex size-5 shrink-0 items-center justify-center rounded-full",
          "bg-text-on-brand/16 ring-1 ring-inset ring-text-on-brand/25",
          "transition-colors duration-200 group-hover:bg-text-on-brand/22",
        )}
        aria-hidden
      >
        <Icons.add className="size-3.5" />
      </span>
      <span className="relative z-10 leading-none">{children}</span>
    </>
  );
}

function isCreateActionLink(
  props: TCreateActionButtonProps,
): props is TCreateActionButtonAsLink {
  return typeof props.href === "string" && props.href.length > 0;
}

/** Primary create / add CTA — solid brand fill for a calm premium SaaS look. */
export function CreateActionButton(props: TCreateActionButtonProps) {
  const { children, className } = props;

  if (isCreateActionLink(props)) {
    return (
      <Link href={props.href} className={cn(createActionSurfaceClass, className)}>
        <CreateActionContent>{children}</CreateActionContent>
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      disabled={props.disabled}
      onClick={props.onClick}
      className={cn(createActionSurfaceClass, className)}
    >
      <CreateActionContent>{children}</CreateActionContent>
    </button>
  );
}
