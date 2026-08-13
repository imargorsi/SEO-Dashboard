"use client";

import type { ReactNode } from "react";

import type { TAppIconComponent } from "@/components/ui/app-icon";
import {
  AlertDialog,
  AlertDialogContent,
} from "@/components/ui/alert-dialog";
import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { Icons } from "@/lib/frontend/icons/app-icons";
import { cn } from "@/lib/utils";

export type TConfirmDialogTone = "destructive" | "default";

export type TConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon?: TAppIconComponent;
  title: string;
  description: string;
  /** Footer actions (e.g. Cancel + Confirm). */
  action: ReactNode;
  tone?: TConfirmDialogTone;
  className?: string;
};

const ICON_WELL: Record<TConfirmDialogTone, string> = {
  destructive: "border-destructive/35 bg-destructive/12 text-destructive",
  default: "border-border bg-bg-hover text-text-secondary",
};

/**
 * Centered confirm modal — icon, title, description, then actions.
 * Layout mirrors EmptyState for a consistent “status” feel.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  icon: Icon = Icons.delete,
  title,
  description,
  action,
  tone = "destructive",
  className,
}: TConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={cn(
          "w-[min(100%-1.5rem,30rem)] gap-0 rounded-lg border-2 border-text-muted/55 p-6 sm:p-7",
          className,
        )}
      >
        <div className="flex flex-col items-stretch text-start">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full border",
                ICON_WELL[tone],
              )}
              aria-hidden
            >
              <Icon className="size-5" />
            </span>
            <Heading sectionTitle className="min-w-0 text-text-primary">
              {title}
            </Heading>
          </div>

          <div className="mt-4 space-y-1.5">
            {description
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean)
              .map((line) => (
                <Paragraph key={line} className="text-text-muted">
                  {line}
                </Paragraph>
              ))}
          </div>

          <div className="mt-7 flex w-full flex-col-reverse items-stretch justify-end gap-2 sm:flex-row sm:items-center">
            {action}
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
