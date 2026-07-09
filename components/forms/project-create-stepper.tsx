"use client";

import { cn } from "@/lib/utils";

type ProjectCreateStepperProps = {
  total: number;
  current: number;
};

export function ProjectCreateStepper({ total, current }: ProjectCreateStepperProps) {
  return (
    <div className="relative" aria-label="Project Creation Steps">
      <div className="pointer-events-none absolute left-4 right-4 top-1/2 h-px -translate-y-1/2 bg-border" aria-hidden />
      <div className="relative flex items-center justify-between gap-3">
        {Array.from({ length: total }).map((_, index) => {
          const stepNumber = index + 1;
          const isActive = index === current;
          const isDone = index < current;

          return (
            <div
              key={stepNumber}
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full type-caption-xs font-semibold",
                isActive
                  ? "bg-gradient-button text-text-on-brand"
                  : isDone
                    ? "border border-border bg-bg-hover text-text-secondary"
                    : "border border-border bg-bg-hover text-text-secondary",
              )}
            >
              {stepNumber}
            </div>
          );
        })}
      </div>
    </div>
  );
}
