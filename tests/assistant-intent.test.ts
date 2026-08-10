import { describe, expect, it } from "vitest";

import {
  detectAssistantIntent,
  permissionForAssistantIntent,
} from "@/lib/assistant/detect-intent";

describe("detectAssistantIntent", () => {
  it("maps lead window phrases", () => {
    expect(detectAssistantIntent("How many leads this month?")).toBe("leads_this_month");
    expect(detectAssistantIntent("leads last month")).toBe("leads_last_month");
    expect(detectAssistantIntent("leads this year")).toBe("leads_this_year");
  });

  it("maps analytics phrases", () => {
    expect(detectAssistantIntent("Show analytics overview")).toBe("analytics_overview");
    expect(detectAssistantIntent("What are the top queries?")).toBe("analytics_top_queries");
    expect(detectAssistantIntent("top pages")).toBe("analytics_top_pages");
  });

  it("returns unknown for unsupported questions", () => {
    expect(detectAssistantIntent("schedule a meeting")).toBe("unknown");
    expect(detectAssistantIntent("")).toBe("unknown");
  });

  it("resolves module permissions per intent", () => {
    expect(permissionForAssistantIntent("leads_this_month")).toBe("leads.view");
    expect(permissionForAssistantIntent("analytics_top_pages")).toBe("analytics.view");
    expect(permissionForAssistantIntent("unknown")).toBeNull();
  });
});
