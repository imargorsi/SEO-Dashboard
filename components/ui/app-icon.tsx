"use client";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactElement,
} from "react";

import { cn } from "@/lib/utils";

/**
 * Visual stroke in CSS pixels (via `absoluteStrokeWidth`).
 * Slightly heavier than Hugeicons’ 1.5 default so small chrome icons stay crisp.
 */
export const APP_ICON_STROKE_WIDTH = 2;

/** Default pixel size — keep integer for sharp rasterization. */
export const APP_ICON_SIZE = 16;

export type TAppIconSvg = IconSvgElement;

export type TAppIconProps = Omit<
  ComponentPropsWithoutRef<typeof HugeiconsIcon>,
  "icon" | "altIcon" | "showAlt"
> & {
  icon: TAppIconSvg;
};

/**
 * Platform icon renderer (Hugeicons free Stroke Rounded).
 * Prefer integer `size` + `currentColor` (Tailwind text / size utilities).
 */
export const AppIcon = forwardRef<SVGSVGElement, TAppIconProps>(function AppIcon(
  {
    icon,
    className,
    size = APP_ICON_SIZE,
    strokeWidth = APP_ICON_STROKE_WIDTH,
    absoluteStrokeWidth = true,
    color = "currentColor",
    ...rest
  },
  ref,
) {
  return (
    <HugeiconsIcon
      ref={ref}
      icon={icon}
      size={size}
      strokeWidth={strokeWidth}
      absoluteStrokeWidth={absoluteStrokeWidth}
      color={color}
      className={cn("shrink-0", className)}
      {...rest}
    />
  );
});

export type TAppIconComponent = ReturnType<typeof createAppIcon>;

/**
 * Builds a drop-in component for icon maps
 * (`<Icon className="size-4" />`).
 */
export function createAppIcon(icon: TAppIconSvg): (
  props: Omit<TAppIconProps, "icon">,
) => ReactElement {
  function CreatedIcon({
    className,
    size = APP_ICON_SIZE,
    strokeWidth = APP_ICON_STROKE_WIDTH,
    absoluteStrokeWidth = true,
    color = "currentColor",
    ...rest
  }: Omit<TAppIconProps, "icon">) {
    return (
      <HugeiconsIcon
        icon={icon}
        size={size}
        strokeWidth={strokeWidth}
        absoluteStrokeWidth={absoluteStrokeWidth}
        color={color}
        className={cn("shrink-0", className)}
        {...rest}
      />
    );
  }
  CreatedIcon.displayName = "CreatedAppIcon";
  return CreatedIcon;
}
