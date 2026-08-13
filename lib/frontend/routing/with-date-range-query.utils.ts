/** Append `from` / `to` query params onto a path, preserving any existing search. */
export function withDateRangeQuery(href: string, from?: string, to?: string): string {
  if (!from && !to) return href;
  const question = href.indexOf("?");
  const path = question === -1 ? href : href.slice(0, question);
  const params = new URLSearchParams(question === -1 ? "" : href.slice(question + 1));
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}
