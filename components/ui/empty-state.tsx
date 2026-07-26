import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { IoFolderOpenOutline } from "react-icons/io5";

import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { cn } from "@/lib/utils";

export type TEmptyStateProps = {
  icon?: IconType;
  title: string;
  description: string;
  className?: string;
  children?: ReactNode;
};

/** Shared dashboard empty / no-data state. Use across modules with icon, title, and description. */
export function EmptyState({
  icon: Icon = IoFolderOpenOutline,
  title,
  description,
  className,
  children,
}: TEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center px-4 py-12 text-center sm:py-14",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Icon className="mb-5 size-10 text-text-muted/55" aria-hidden />

      <Heading sectionTitle className="text-text-primary">
        {title}
      </Heading>
      <Paragraph className="mt-2 max-w-md text-text-muted">{description}</Paragraph>

      {children ? <div className="mt-7">{children}</div> : null}
    </div>
  );
}
