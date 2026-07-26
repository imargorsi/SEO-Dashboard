/**
 * Allows only http(s) absolute URLs. Rejects javascript:/data:/etc.
 * Shared implementation lives in `lib/seo-activities/sanitize-url.ts`.
 */
export { sanitizeHttpUrl } from "@/lib/seo-activities/sanitize-url";
