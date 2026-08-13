/** Decode percent-encoded dimension values so list answers stay readable. */
export function formatAssistantListLabel(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return value;

  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
}
