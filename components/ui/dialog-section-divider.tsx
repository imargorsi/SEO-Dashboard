import { dialogSectionDividerClass } from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

type TDialogSectionDividerProps = {
  className?: string;
};

/**
 * Shared centered-modal header/footer divider (90% width).
 * Default for all create/edit/import dialogs unless an explicit exception is needed.
 */
export function DialogSectionDivider({ className }: TDialogSectionDividerProps) {
  return <div aria-hidden className={cn(dialogSectionDividerClass, className)} />;
}
