"use client";

import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { typeStackMdClass } from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

type AuthFormHeaderProps = {
  id: string;
  title: string;
  subtitle?: string;
  subtitleClassName?: string;
};

/**
 * Auth card title + description — centered under the shared brand mark.
 */
export function AuthFormHeader({ id, title, subtitle, subtitleClassName }: AuthFormHeaderProps) {
  return (
    <header className={cn("flex flex-col items-center text-center", typeStackMdClass)}>
      <Heading id={id} pageTitle>
        {title}
      </Heading>
      {subtitle ? (
        <Paragraph
          className={cn(
            "max-w-sm type-body leading-relaxed text-text-secondary",
            subtitleClassName,
          )}
        >
          {subtitle}
        </Paragraph>
      ) : null}
    </header>
  );
}
