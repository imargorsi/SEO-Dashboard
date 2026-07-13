import type { TProjectCardActionTone } from "@/lib/projects/project-card-actions.utils";

export const ACTION_ICON_WELL: Record<TProjectCardActionTone, string> = {
  success: "border-status-active/35 bg-status-active/12 text-status-active",
  warning: "border-status-pending/35 bg-status-pending/12 text-status-pending",
  destructive: "border-status-rejected/35 bg-status-rejected/12 text-status-rejected",
  muted: "border-border bg-bg-card text-text-secondary",
  brand: "border-brand/35 bg-brand/12 text-brand",
  default: "border-brand/30 bg-gradient-button/15 text-brand",
};

export const ACTION_BUTTON_TONE: Record<TProjectCardActionTone, string> = {
  success:
    "border-status-active/40 bg-status-active/12 text-status-active hover:bg-status-active/20 hover:border-status-active/55",
  warning:
    "border-status-pending/40 bg-status-pending/12 text-status-pending hover:bg-status-pending/20 hover:border-status-pending/55",
  destructive:
    "border-status-rejected/40 bg-status-rejected/12 text-status-rejected hover:bg-status-rejected/20 hover:border-status-rejected/55",
  muted:
    "border-border bg-bg-card text-text-secondary hover:bg-bg-hover hover:text-text-primary hover:border-border",
  brand: "border-brand/40 bg-brand/12 text-brand hover:bg-brand/20 hover:border-brand/55",
  default: "border-brand/35 bg-brand/12 text-brand hover:bg-brand/20 hover:border-brand/50",
};
