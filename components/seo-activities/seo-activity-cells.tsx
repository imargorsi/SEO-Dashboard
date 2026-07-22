import { sanitizeHttpUrl } from "@/lib/seo-activities/sanitize-url";
import { getStatusDotClassName } from "@/lib/frontend/theme/status-colors";
import { cn } from "@/lib/utils";

type TSeoActivityLinkCellProps = {
  href: string | null;
  className?: string;
};

type TSeoActivityAnchorCellProps = {
  label: string | null;
  className?: string;
};

function displayUrl(href: string): string {
  try {
    const url = new URL(href);
    const path = `${url.hostname}${url.pathname}`.replace(/\/$/, "");
    return path.length > 42 ? `${path.slice(0, 42)}...` : path;
  } catch {
    return href.length > 42 ? `${href.slice(0, 42)}...` : href;
  }
}

export function SeoActivityLinkCell({ href, className }: TSeoActivityLinkCellProps) {
  const safeHref = sanitizeHttpUrl(href);

  if (!href) {
    return <span className="type-body text-text-muted">—</span>;
  }

  if (!safeHref) {
    return (
      <span className={cn("block max-w-[18rem] truncate type-body text-text-muted sm:max-w-[24rem]", className)}>
        {displayUrl(href)}
      </span>
    );
  }

  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block max-w-[18rem] truncate type-body text-text-primary underline-offset-2 hover:text-brand hover:underline sm:max-w-[24rem]",
        className,
      )}
      title={safeHref}
    >
      {displayUrl(safeHref)}
    </a>
  );
}

export function SeoActivityAnchorCell({ label, className }: TSeoActivityAnchorCellProps) {
  if (!label) {
    return <span className="type-body text-text-muted">—</span>;
  }

  return (
    <span className={cn("inline-flex items-center gap-2 type-body text-text-primary", className)}>
      <span className={cn("size-2 shrink-0 rounded-full", getStatusDotClassName("active"))} aria-hidden />
      <span className="min-w-0 truncate">{label}</span>
    </span>
  );
}
