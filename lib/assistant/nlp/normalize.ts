/** Strip question/quote punctuation and collapse whitespace. */
export function normalizeAssistantQuery(query: string): string {
  return query.replace(/[?!.,;:"'`]+/g, " ").replace(/\s+/g, " ").trim();
}
