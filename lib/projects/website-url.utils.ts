/** Optional protocol/www, one or more dot-separated labels, then an alphabetic TLD. */
export const WEBSITE_URL_PATTERN =
  /^(https?:\/\/)?(www\.)?([a-z0-9](-*[a-z0-9])*\.)+[a-z]{2,}(\/[^\s]*)?$/i;

/** Ensure stored website URLs always include an http(s) scheme. */
export function normalizeWebsiteUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** True when the value looks like a navigable http(s) URL or bare domain. */
export function isHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      return Boolean(url.hostname) && (url.protocol === "http:" || url.protocol === "https:");
    } catch {
      return false;
    }
  }

  return WEBSITE_URL_PATTERN.test(trimmed);
}

/** Href for competitor/domain strings that may omit the scheme. */
export function toExternalHref(value: string): string {
  return normalizeWebsiteUrl(value);
}
