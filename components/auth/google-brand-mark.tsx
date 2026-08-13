"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";

type TGoogleBrandMarkProps = {
  /** Pixel size for both width and height. */
  size?: number;
  className?: string;
  alt?: string;
};

/** Official multicolor Google "G" mark (auth + account-source chips). */
export function GoogleBrandMark({ size = 20, className, alt = "" }: TGoogleBrandMarkProps) {
  return (
    <Image
      src="/icons/google-icon.svg"
      alt={alt}
      width={size}
      height={size}
      className={cn("object-contain", className)}
      unoptimized
    />
  );
}
