import type { TGoogleIntegrationService } from "@/lib/integrations/constants";

/** Official product marks under `/public/icons` for Google integrations. */
export const GOOGLE_INTEGRATION_LOGO_SRC = {
  gsc: "/icons/google-search-console-icon.svg",
  ga4: "/icons/google-analytics-icon.svg",
} as const satisfies Record<TGoogleIntegrationService, string>;
