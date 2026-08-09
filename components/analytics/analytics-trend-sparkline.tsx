"use client";

import { useId, useMemo } from "react";

import { buildSparklinePathsFromValues } from "@/lib/frontend/analytics/sparkline.utils";
import { cn } from "@/lib/utils";

type TAnalyticsTrendSparklineProps = {
  id: string;
  accent: string;
  values: number[];
  reduceMotion: boolean;
  /** SVG viewBox height — summary cards use 64, compact stacks use 48. */
  height?: number;
  className?: string;
};

export function AnalyticsTrendSparkline({
  id,
  accent,
  values,
  reduceMotion,
  height = 64,
  className,
}: TAnalyticsTrendSparklineProps) {
  const reactId = useId().replace(/:/g, "");
  const gradId = `${id}-${reactId}-fill`;
  const width = 280;

  const preferRising = useMemo(() => {
    if (values.length < 2) return null;
    const first = values[0]!;
    const last = values[values.length - 1]!;
    if (last > first) return true;
    if (last < first) return false;
    return null;
  }, [values]);

  const paths = useMemo(
    () => buildSparklinePathsFromValues(values, width, height, { preferRising }),
    [height, preferRising, values],
  );

  if (!paths) return null;

  return (
    <svg
      className={cn("h-full w-full", !reduceMotion && "seo-sparkline-wave", className)}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: accent, stopOpacity: 0.22 }} />
          <stop offset="100%" style={{ stopColor: accent, stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <path
        d={paths.area}
        fill={`url(#${gradId})`}
        className={cn(!reduceMotion && "seo-sparkline-area-live")}
      />
      <path
        d={paths.line}
        fill="none"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <circle
        cx={paths.end.x}
        cy={paths.end.y}
        r="3"
        fill={accent}
        stroke="var(--bg-card)"
        strokeWidth="1.25"
      />
    </svg>
  );
}
