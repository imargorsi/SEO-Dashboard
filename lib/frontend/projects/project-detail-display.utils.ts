import type { TProjectBusinessHours } from "@/features/projects/projects.api";
import { formatShortDate } from "@/lib/frontend/date/format-relative-date.utils";

export function displayDetailValue(value: string | null | undefined, emptyLabel = "—"): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : emptyLabel;
}

export function formatBusinessHours(
  hours: TProjectBusinessHours,
  emptyLabel = "—",
): string {
  if (!hours) return emptyLabel;

  const opensAt = hours.opensAt?.trim();
  const closesAt = hours.closesAt?.trim();

  if (opensAt && closesAt) return `${opensAt} – ${closesAt}`;
  if (opensAt) return opensAt;
  if (closesAt) return closesAt;
  return emptyLabel;
}

export function formatProjectDate(isoDate: string | null | undefined, locale = "en"): string {
  if (!isoDate) return "—";
  return formatShortDate(isoDate, locale);
}

export function resolveStatusDate(
  status: string,
  approvedAt: string | null,
  rejectedAt: string | null,
  updatedAt: string,
): string {
  if (status === "active" && approvedAt) return approvedAt;
  if (status === "rejected" && rejectedAt) return rejectedAt;
  return updatedAt;
}
