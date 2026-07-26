"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TTableRowIconAction = {
  key: string;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

type TTableRowIconActionsProps = {
  actions: TTableRowIconAction[];
  className?: string;
};

/** Frosted glass icon buttons — sit above dense table rows without heavy fills. */
export const tableRowIconActionClass =
  "rounded-full border-border/55 bg-bg-card/35 text-text-secondary shadow-sm backdrop-blur-md backdrop-saturate-150 hover:border-border hover:bg-bg-hover/55 hover:text-text-primary hover:shadow-md";

export function TableRowIconActions({ actions, className }: TTableRowIconActionsProps) {
  return (
    <div className={cn("flex items-center justify-end gap-1", className)}>
      {actions.map((action) => (
        <Button
          key={action.key}
          type="button"
          variant="outline"
          size="icon-sm"
          className={cn(tableRowIconActionClass, action.className)}
          aria-label={action.label}
          disabled={action.disabled}
          onClick={action.onClick}
        >
          {action.icon}
        </Button>
      ))}
    </div>
  );
}
