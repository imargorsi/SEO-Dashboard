import { sanitizeHttpUrl } from "@/lib/frontend/seo-activities/sanitize-url.utils";
import { cn } from "@/lib/utils";
import { IoFolderOpenOutline, IoOpenOutline } from "react-icons/io5";

type TSeoActivityLinkCellProps = {
  href: string | null;
  className?: string;
};

type TSeoActivityStackedDateCellProps = {
  isoDate: string | null;
};

type TSeoActivityDetailsCellProps = {
  title: string | null;
  projectName: string | null;
  className?: string;
};

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function displayUrl(href: string): string {
  try {
    const url = new URL(href);
    const path = `${url.hostname}${url.pathname}`.replace(/\/$/, "");
    return path.length > 42 ? `${path.slice(0, 42)}...` : path;
  } catch {
    return href.length > 42 ? `${href.slice(0, 42)}...` : href;
  }
}

function dash(value: string | null | undefined) {
  return value?.trim() ? value : "—";
}

export function SeoActivityStackedDateCell({ isoDate }: TSeoActivityStackedDateCellProps) {
  if (!isoDate) {
    return <span className="type-body text-text-muted">—</span>;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!match) {
    return <span className="type-body-strong text-text-primary">{isoDate}</span>;
  }

  const day = Number(match[3]);
  const month = Number(match[2]);
  const monthLabel = MONTHS_SHORT[month - 1] ?? "";

  return (
    <div className="flex min-w-12 flex-col leading-none">
      <span className="type-h2 text-text-primary">{day}</span>
      <span className="mt-1 type-overline text-text-muted">{monthLabel}</span>
    </div>
  );
}

export function SeoActivityDetailsCell({
  title,
  projectName,
  className,
}: TSeoActivityDetailsCellProps) {
  return (
    <div className={cn("min-w-0 max-w-[18rem] space-y-1.5 sm:max-w-[24rem]", className)}>
      <p className="line-clamp-2 type-body-strong text-text-primary" title={title ?? undefined}>
        {dash(title)}
      </p>
      <p className="inline-flex min-w-0 items-center gap-1.5 type-caption text-text-muted">
        <IoFolderOpenOutline className="size-3.5 shrink-0" aria-hidden />
        <span className="truncate">{dash(projectName)}</span>
      </p>
    </div>
  );
}

export function SeoActivityLinkCell({ href, className }: TSeoActivityLinkCellProps) {
  const safeHref = sanitizeHttpUrl(href);

  if (!href) {
    return <span className="type-body text-text-muted">—</span>;
  }

  if (!safeHref) {
    return (
      <span
        className={cn(
          "inline-flex max-w-[18rem] items-center gap-2 truncate type-body text-text-muted sm:max-w-[24rem]",
          className,
        )}
      >
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
        "inline-flex max-w-[18rem] items-center gap-2 truncate type-body text-text-secondary transition-colors hover:text-brand sm:max-w-[24rem]",
        className,
      )}
      title={safeHref}
    >
      <span className="truncate">{displayUrl(safeHref)}</span>
      <IoOpenOutline className="size-3.5 shrink-0" aria-hidden />
    </a>
  );
}
