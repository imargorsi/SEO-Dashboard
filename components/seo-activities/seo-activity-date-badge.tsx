import { cn } from "@/lib/utils";

type TSeoActivityDateBadgeProps = {
  label: string | null;
  className?: string;
};

export function SeoActivityDateBadge({ label, className }: TSeoActivityDateBadgeProps) {
  if (!label) {
    return <span className="type-body text-text-muted">—</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xl border border-border bg-bg-input px-3 py-1.5 type-caption text-text-secondary",
        className,
      )}
    >
      {label}
    </span>
  );
}
