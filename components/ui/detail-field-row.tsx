"use client";

import type { ReactNode } from "react";
import type { IconType } from "react-icons";

import { detailIconWellClass } from "@/lib/frontend/layout/dashboard-chrome";

type TDetailSectionHeadingProps = {
  title: string;
  description: string;
};

/** Title + lead for detail sheet / side-panel sections. */
export function DetailSectionHeading({ title, description }: TDetailSectionHeadingProps) {
  return (
    <div className="min-w-0 space-y-0.5">
      <h3 className="type-label text-text-primary">{title}</h3>
      <p className="type-caption text-text-muted">{description}</p>
    </div>
  );
}

type TDetailFieldRowProps = {
  icon: IconType;
  label: string;
  children: ReactNode;
};

/** Icon + label + value row for detail sheets. */
export function DetailFieldRow({ icon: Icon, label, children }: TDetailFieldRowProps) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className={detailIconWellClass} aria-hidden>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 space-y-0.5">
        <p className="type-caption-xs tracking-[0.08em] uppercase text-text-muted">{label}</p>
        <div className="type-body text-text-primary wrap-break-word">{children}</div>
      </div>
    </div>
  );
}
