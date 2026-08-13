"use client";

import { useMemo } from "react";

import { buildSparklineBarsFromValues } from "@/lib/frontend/analytics/sparkline.utils";
import { cn } from "@/lib/utils";

type TAnalyticsTrendBarsProps = {
  accent: string;
  values: number[];
  className?: string;
};

export function AnalyticsTrendBars({ accent, values, className }: TAnalyticsTrendBarsProps) {
  const bars = useMemo(
    () => buildSparklineBarsFromValues(values, 280, 40, 24),
    [values],
  );

  if (bars.length === 0) return null;

  return (
    <svg
      className={cn("h-full w-full", className)}
      viewBox="0 0 280 40"
      preserveAspectRatio="none"
      aria-hidden
    >
      {bars.map((bar, index) => (
        <rect
          key={`${bar.x}-${index}`}
          x={bar.x}
          y={bar.y}
          width={bar.width}
          height={bar.height}
          rx="1.25"
          fill={accent}
          opacity={index === bars.length - 1 ? 0.95 : 0.55}
        />
      ))}
    </svg>
  );
}
