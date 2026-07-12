"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type TRoleScopeBadgeProps = {
  scope: "platform" | "project";
  label: string;
  className?: string;
};

export function RoleScopeBadge({ scope, label, className }: TRoleScopeBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "type-caption-xs capitalize",
        scope === "platform"
          ? "border-brand/35 bg-brand/12 text-brand"
          : "border-accent-border bg-accent-bg text-text-primary",
        className,
      )}
    >
      {label}
    </Badge>
  );
}
