import { describe, expect, it } from "vitest";

import {
  FEEDBACK_MAX_WORDS,
  formatFeedbackText,
  toSentenceCaseFeedbackText,
  truncateFeedbackText,
} from "@/lib/frontend/feedback/format";

describe("feedback format", () => {
  it("uses sentence case without title-casing every word", () => {
    expect(toSentenceCaseFeedbackText("account created. check your email.")).toBe(
      "Account created. Check your email.",
    );
    expect(formatFeedbackText("project settings updated")).toBe("Project settings updated");
  });

  it("caps toast copy at eight essential words", () => {
    expect(FEEDBACK_MAX_WORDS).toBe(8);

    const words = Array.from({ length: FEEDBACK_MAX_WORDS + 4 }, (_, i) => `word${i + 1}`);
    const result = truncateFeedbackText(words.join(" "));

    expect(result.endsWith("...")).toBe(true);
    expect(result.replace("...", "").trim().split(/\s+/)).toHaveLength(FEEDBACK_MAX_WORDS);
  });

  it("collapses whitespace before truncating", () => {
    expect(truncateFeedbackText("  one   two\n\nthree  ")).toBe("one two three");
  });

  it("keeps essential short phrases intact", () => {
    expect(formatFeedbackText("Account created. Check your email.")).toBe(
      "Account created. Check your email.",
    );
  });
});
