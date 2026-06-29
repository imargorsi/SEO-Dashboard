import { api } from "@/lib/api"

export type SwrKey = string | readonly [string, ...unknown[]] | null

/**
 * Default SWR fetcher — uses `api.get` (API key, locale, Bearer token).
 *
 * - `useSWR('users/me')`
 * - `useSWR(['reports', { page: 1, type: 'seo' }])` → `GET reports?page=1&type=seo`
 *
 * Paths are relative to `VITE_API_BASE_URL` (see `lib/api.ts`).
 */
export async function swrFetcher<T = unknown>(
  key: SwrKey,
): Promise<T> {
  if (key == null) {
    throw new Error("SWR key is null")
  }
  if (typeof key === "string") {
    return api.get<T>(key)
  }
  const [path, ...rest] = key
  if (typeof path !== "string") {
    throw new Error("SWR: first tuple element must be an API path string")
  }
  if (rest.length === 0) {
    return api.get<T>(path)
  }
  const maybeQuery = rest[0]
  if (
    maybeQuery != null &&
    typeof maybeQuery === "object" &&
    !Array.isArray(maybeQuery)
  ) {
    const q = new URLSearchParams()
    for (const [k, v] of Object.entries(
      maybeQuery as Record<string, unknown>,
    )) {
      if (v === undefined || v === null) continue
      q.set(k, String(v))
    }
    const qs = q.toString()
    return api.get<T>(qs ? `${path}?${qs}` : path)
  }
  return api.get<T>(path)
}
