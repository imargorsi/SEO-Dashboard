"use client";

import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { cn } from "@/lib/utils";

type AuthFormHeaderProps = {
  id: string;
  title: string;
  subtitle?: string;
  subtitleClassName?: string;
};

/** Shared auth card title + description spacing across sign-in, register, and password flows. */
export function AuthFormHeader({ id, title, subtitle, subtitleClassName }: AuthFormHeaderProps) {
  return (
    <header className="flex flex-col gap-3">
      <Heading id={id} pageTitle>
        {title}
      </Heading>
      {subtitle ? (
        <Paragraph
          className={cn(
            "text-sm font-normal leading-relaxed text-text-secondary",
            subtitleClassName,
          )}
        >
          {subtitle}
        </Paragraph>
      ) : null}
    </header>
  );
}
