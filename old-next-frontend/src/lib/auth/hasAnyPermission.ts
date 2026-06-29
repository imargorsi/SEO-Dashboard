/** True if `permissions` includes at least one exact string from `candidates`. */
export function hasAnyPermission(
  permissions: readonly string[] | undefined | null,
  candidates: readonly string[],
): boolean {
  if (!permissions?.length || !candidates.length) return false
  const set = new Set(permissions)
  for (const c of candidates) {
    if (set.has(c)) return true
  }
  return false
}
