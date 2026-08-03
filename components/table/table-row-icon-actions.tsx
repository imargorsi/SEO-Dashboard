"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { tableRowIconActionClass } from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

export { tableRowIconActionClass };

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

export function TableRowIconActions({ actions, className }: TTableRowIconActionsProps) {
  return (
    <div className={cn("flex items-center justify-end gap-1.5", className)}>
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
