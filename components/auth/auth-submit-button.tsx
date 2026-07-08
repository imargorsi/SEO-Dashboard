import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type AuthSubmitButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
};

export function AuthSubmitButton({
  children,
  disabled,
  className,
  type = "submit",
  onClick,
}: AuthSubmitButtonProps) {
  return (
    <Button
      type={type}
      disabled={disabled}
      aria-busy={disabled}
      onClick={onClick}
      variant="gradient"
      size="lg"
      className={cn(
        "w-full",
        className
      )}
    >
      {children}
    </Button>
  );
}
