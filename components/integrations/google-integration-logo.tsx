"use client";

import Image from "next/image";

import { GOOGLE_INTEGRATION_LOGO_SRC } from "@/lib/integrations/google-integration-logos";
import type { TGoogleIntegrationService } from "@/lib/integrations/constants";
import { cn } from "@/lib/utils";

type TGoogleIntegrationLogoProps = {
  service: TGoogleIntegrationService;
  /** Pixel size for both width and height. */
  size?: number;
  className?: string;
  alt?: string;
};

/** Official GSC / GA4 product mark (full color SVG). */
export function GoogleIntegrationLogo({
  service,
  size = 20,
  className,
  alt = "",
}: TGoogleIntegrationLogoProps) {
  return (
    <Image
      src={GOOGLE_INTEGRATION_LOGO_SRC[service]}
      alt={alt}
      width={size}
      height={size}
      className={cn("object-contain", className)}
      unoptimized
    />
  );
}
