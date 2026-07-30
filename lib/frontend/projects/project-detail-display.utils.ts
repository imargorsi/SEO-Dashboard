import { formatShortDate } from "@/lib/frontend/date/format-relative-date.utils";
import { isHttpUrl, toExternalHref } from "@/lib/projects/website-url.utils";

export function displayDetailValue(value: string | null | undefined, emptyLabel = "—"): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : emptyLabel;
}

export { isHttpUrl, toExternalHref };

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
