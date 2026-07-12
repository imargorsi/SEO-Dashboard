import type { ProjectStatus } from "@/lib/projects/constants";

/** Status color keys — mirror `--status-*` tokens in `app/globals.css`. */
export const STATUS_COLOR_KEYS = ["active", "pending", "inactive", "rejected", "invited"] as const;

export type TStatusColorKey = (typeof STATUS_COLOR_KEYS)[number];

export const STATUS_CHIP_CLASSES: Record<TStatusColorKey, string> = {
  active: "border-status-active/40 bg-status-active/10 text-status-active",
  pending: "border-status-pending/40 bg-status-pending/10 text-status-pending",
  inactive: "border-status-inactive/40 bg-status-inactive/10 text-status-inactive",
  rejected: "border-status-rejected/40 bg-status-rejected/10 text-status-rejected",
  invited: "border-status-invited/40 bg-status-invited/10 text-status-invited",
};

export const STATUS_DOT_CLASSES: Record<TStatusColorKey, string> = {
  active: "bg-status-active",
  pending: "bg-status-pending",
  inactive: "bg-status-inactive",
  rejected: "bg-status-rejected",
  invited: "bg-status-invited",
};

export const STATUS_TEXT_CLASSES: Record<TStatusColorKey, string> = {
  active: "text-status-active",
  pending: "text-status-pending",
  inactive: "text-status-inactive",
  rejected: "text-status-rejected",
  invited: "text-status-invited",
};

export function getProjectStatusColorKey(status: ProjectStatus): TStatusColorKey {
  return status;
}

export function getStatusChipClassName(key: TStatusColorKey): string {
  return STATUS_CHIP_CLASSES[key];
}

export function getStatusDotClassName(key: TStatusColorKey): string {
  return STATUS_DOT_CLASSES[key];
}

export function getStatusTextClassName(key: TStatusColorKey): string {
  return STATUS_TEXT_CLASSES[key];
}

/** Badge tone keys — semantic labels for role/system badges (not always 1:1 with status keys). */
export const BADGE_TONE_KEYS = ["brand", "info", "warning", "success", "muted", "destructive"] as const;

export type TBadgeTone = (typeof BADGE_TONE_KEYS)[number];

export const BADGE_TONE_CLASSES: Record<TBadgeTone, string> = {
  brand: "border-brand/35 bg-brand/12 text-brand",
  info: "border-accent-border bg-accent-bg text-text-primary",
  warning: STATUS_CHIP_CLASSES.pending,
  success: STATUS_CHIP_CLASSES.active,
  muted: "border-border bg-bg-hover text-text-muted",
  destructive: STATUS_CHIP_CLASSES.rejected,
};

export function getBadgeToneClassName(tone: TBadgeTone): string {
  return BADGE_TONE_CLASSES[tone];
}
