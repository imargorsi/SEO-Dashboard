export const FEEDBACK_MAX_WORDS = 8;

/**
 * Sentence-case toast copy: capitalize the start of each sentence.
 * Does not title-case every word. Author toast strings in sentence case at the source.
 */
export function toSentenceCaseFeedbackText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;

  return trimmed.replace(/(^\s*[a-zA-Z])|([.!?]\s+[a-zA-Z])/g, (match) => match.toLocaleUpperCase());
}

/**
 * Cap toast copy at a short essential phrase (default 8 words).
 * Keep critical cues (e.g. check email); append "..." when truncated.
 */
export function truncateFeedbackText(text: string, maxWords = FEEDBACK_MAX_WORDS): string {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (!normalized || maxWords <= 0) return normalized;

  const words = normalized.split(" ");
  if (words.length <= maxWords) return normalized;

  return `${words.slice(0, maxWords).join(" ")}...`;
}

/** Apply toast copy rules: sentence case + short essential phrase. */
export function formatFeedbackText(text: string): string {
  return truncateFeedbackText(toSentenceCaseFeedbackText(text));
}
