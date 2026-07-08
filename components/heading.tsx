"use client";

import { cn } from "@/lib/utils";
import type { FC, ReactNode } from "react";

interface IHeading {
  children: ReactNode;
  id?: string;
  className?: string;
  heroTitle?: boolean;
  mediumTitle?: boolean;
  SmallTitle?: boolean;
  invertColors?: boolean;
  bold?: string;
  isMainHeading?: boolean;
  /** Compact h1 for auth / app pages (uses theme tokens). */
  pageTitle?: boolean;
  /** Compact h2 for supporting panels (uses theme tokens). */
  sectionTitle?: boolean;
  customHeadingTag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export const Heading: FC<IHeading> = (props) => {
  const {
    children,
    id,
    className,
    heroTitle,
    mediumTitle,
    invertColors,
    bold,
    isMainHeading,
    SmallTitle,
    customHeadingTag,
    pageTitle,
    sectionTitle,
  } = props;

  const getTextSizes = () => {
    if (pageTitle) {
      return "type-h1";
    }
    if (sectionTitle) {
      return "type-h2";
    }
    if (isMainHeading) return "type-display !font-bold";
    if (heroTitle) return "type-display !font-bold";
    if (mediumTitle) return "type-h2";
    if (SmallTitle) return "type-title";
    return "type-title";
  };

  const HeadingTag =
    customHeadingTag ||
    (pageTitle ? "h1" : sectionTitle ? "h2" : isMainHeading ? "h1" : heroTitle || mediumTitle ? "h2" : "h3");

  return (
    <HeadingTag
      id={id}
      className={cn(
        "font-sans",
        pageTitle || sectionTitle ? null : bold || "font-semibold",
        getTextSizes(),
        invertColors ? "text-text-on-brand" : "text-text-primary",
        className
      )}
    >
      {children}
    </HeadingTag>
  );
};
