import type { ReactNode } from "react";

import type { TAppIconComponent } from "@/components/ui/app-icon";
import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import {
  emptyStateIconWellClass,
  emptyStateShellClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import { Icons } from "@/lib/frontend/icons/app-icons";
import { cn } from "@/lib/utils";

export type TEmptyStateProps = {
  icon?: TAppIconComponent;
  title: string;
  description: string;
  className?: string;
  children?: ReactNode;
};

/** Shared dashboard empty / no-data state — glassy icon well + spaced copy. */
export function EmptyState({
  icon: Icon = Icons.folderOpen,
  title,
  description,
  className,
  children,
}: TEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center px-4 py-10 sm:py-12",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className={emptyStateShellClass}>
        <span className={emptyStateIconWellClass} aria-hidden>
          <Icon className="size-6" />
        </span>

        <div className="mt-6 flex flex-col items-center gap-2.5">
          <Heading sectionTitle className="text-text-primary">
            {title}
          </Heading>
          <Paragraph className="max-w-sm text-text-muted">{description}</Paragraph>
        </div>

        {children ? <div className="mt-7">{children}</div> : null}
      </div>
    </div>
  );
}
