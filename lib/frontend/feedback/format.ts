
export function capitalizeFeedbackText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;

  return trimmed.replace(/\S+/g, (word) => word.charAt(0).toLocaleUpperCase() + word.slice(1));
}
