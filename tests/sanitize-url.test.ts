import { describe, expect, it } from "vitest";

import { sanitizeHttpUrl } from "@/lib/seo-activities/sanitize-url";

describe("sanitizeHttpUrl", () => {
  it("allows http and https urls", () => {
    expect(sanitizeHttpUrl("https://example.com/path")).toBe("https://example.com/path");
    expect(sanitizeHttpUrl("http://example.com")).toBe("http://example.com/");
  });

  it("rejects unsafe schemes and invalid values", () => {
    expect(sanitizeHttpUrl("javascript:alert(1)")).toBeNull();
    expect(sanitizeHttpUrl("data:text/html,hi")).toBeNull();
    expect(sanitizeHttpUrl("not a url")).toBeNull();
    expect(sanitizeHttpUrl("")).toBeNull();
    expect(sanitizeHttpUrl(null)).toBeNull();
  });
});
