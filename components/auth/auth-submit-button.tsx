import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AuthSubmitButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  className?: string;
};

export function AuthSubmitButton({ children, disabled, className }: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled}
      aria-busy={disabled}
      className={cn(
        "flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand)] text-sm font-medium text-white transition-colors",
        "hover:bg-[var(--brand)]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]",
        "disabled:pointer-events-none disabled:opacity-60",
        className
      )}
    >
      {children}
    </button>
  );
}
