import {
  getStatusChipClassName,
  getStatusDotClassName,
  type TStatusColorKey,
} from "@/lib/frontend/theme/status-colors";
import { cn } from "@/lib/utils";

type TStatusChipProps = {
  colorKey: TStatusColorKey;
  label: string;
  className?: string;
  /** Leading status dot — on by default for table/list chips. */
  showDot?: boolean;
};

/** Unified status pill — always uses fixed `--status-*` chip tokens. */
export function StatusChip({ colorKey, label, className, showDot = true }: TStatusChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 type-overline uppercase tracking-[0.08em]",
        getStatusChipClassName(colorKey),
        className,
      )}
    >
      {showDot ? (
        <span className={cn("size-1.5 shrink-0 rounded-full", getStatusDotClassName(colorKey))} aria-hidden />
      ) : null}
      <span>{label}</span>
    </span>
  );
}
