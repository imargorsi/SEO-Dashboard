"use client";

import { IoGlobeOutline } from "react-icons/io5";

import { UserAvatar } from "@/components/ui/user-avatar";
import {
  typeIconTextClass,
  typeStackIdentityClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

type TProjectIdentityProps = {
  name: string;
  websiteUrl?: string | null;
  imageUrl?: string | null;
  meta?: string | null;
  className?: string;
  size?: "md" | "lg";
};

/** Compact project identity — same logo / name / URL language as `ProjectCard`. */
export function ProjectIdentity({
  name,
  websiteUrl,
  imageUrl,
  meta,
  className,
  size = "lg",
}: TProjectIdentityProps) {
  const url = websiteUrl?.trim() || null;

  return (
    <div className={cn("flex min-w-0 items-start gap-4", className)}>
      <UserAvatar
        name={name}
        imageUrl={imageUrl ?? null}
        size={size}
        variant="logo"
        className="shrink-0"
      />
      <div className={cn("min-w-0", typeStackIdentityClass)}>
        <p className="truncate type-title text-text-primary">{name}</p>
        {url ? (
          <p className={cn(typeIconTextClass, "type-caption text-text-muted")}>
            <IoGlobeOutline className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{url}</span>
          </p>
        ) : null}
        {meta ? <p className="type-caption text-text-muted">{meta}</p> : null}
      </div>
    </div>
  );
}
