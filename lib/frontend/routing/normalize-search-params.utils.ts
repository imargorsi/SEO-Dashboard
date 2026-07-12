export function normalizeSearchParams(sp: URLSearchParams): string {
  const entries = Array.from(sp.entries()).sort((a, b) =>
    a[0] === b[0] ? a[1].localeCompare(b[1]) : a[0].localeCompare(b[0]),
  );
  return new URLSearchParams(entries).toString();
}
