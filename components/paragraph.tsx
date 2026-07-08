"use client";

import { cn } from "@/lib/utils";
import type { FC, ReactNode } from "react";

interface IParagraph {
  children: ReactNode;
  className?: string;
  IsYellow?: boolean;
  larger?: boolean;
  smaller?: boolean;
  medium?: boolean;
  moreSmaller?: boolean;
  invertColors?: boolean;
}

export const Paragraph: FC<IParagraph> = (props) => {
  const { children, className, larger, IsYellow = false, smaller, invertColors, medium, moreSmaller } = props;

  const getTextSize = () => {
    if (larger) return "type-h2";
    if (medium) return "type-title";
    if (smaller) return "type-body";
    if (moreSmaller) return "type-caption";
    return "type-body";
  };

  return (
    <p
      className={cn(
        getTextSize(),
        invertColors ? "text-text-on-brand" : IsYellow ? "text-brand" : "text-text-secondary",
        className
      )}
    >
      {children}
    </p>
  );
};
