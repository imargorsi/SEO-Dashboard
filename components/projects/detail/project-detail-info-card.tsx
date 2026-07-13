"use client";

import type { ReactNode } from "react";

import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import {
  elevatedCardBodyClass,
  elevatedCardMutedClass,
  elevatedCardSurfaceClass,
  elevatedCardTitleClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

type ProjectDetailInfoCardProps = {
  title: string;
  lead?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
};

export function ProjectDetailInfoCard({
  title,
  lead,
  children,
  className,
  action,
}: ProjectDetailInfoCardProps) {
  return (
    <section className={cn(elevatedCardSurfaceClass, "rounded-3xl p-5 sm:p-6", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <Heading sectionTitle className={elevatedCardTitleClass}>
            {title}
          </Heading>
          {lead ? <Paragraph className={cn("type-body", elevatedCardMutedClass)}>{lead}</Paragraph> : null}
        </div>
        {action}
      </div>
      <div className={cn("mt-5", elevatedCardBodyClass)}>{children}</div>
    </section>
  );
}

type ProjectDetailFieldProps = {
  label: string;
  value: ReactNode;
  className?: string;
};

export function ProjectDetailField({ label, value, className }: ProjectDetailFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <p className={cn("type-caption-xs uppercase tracking-[0.08em]", elevatedCardMutedClass)}>{label}</p>
      <div className={cn("type-body-strong", elevatedCardTitleClass)}>{value}</div>
    </div>
  );
}

type ProjectDetailTagListProps = {
  items: string[];
  emptyLabel: string;
};

export function ProjectDetailTagList({ items, emptyLabel }: ProjectDetailTagListProps) {
  if (items.length === 0) {
    return <p className={cn("type-body", elevatedCardMutedClass)}>{emptyLabel}</p>;
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full border border-border bg-bg-input px-3 py-1.5 type-caption text-text-primary"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
