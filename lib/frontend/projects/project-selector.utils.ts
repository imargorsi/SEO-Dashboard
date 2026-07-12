export function formatProjectHostname(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}
