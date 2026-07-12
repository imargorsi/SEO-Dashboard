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
          className="border-border bg-bg-input text-text-secondary hover:bg-bg-hover hover:text-text-primary"
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
