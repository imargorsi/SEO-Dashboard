import { describe, expect, it } from "vitest";

import { extractAssistantEntities, getAssistantNlp } from "@/lib/assistant/nlp/engine";
import { parseAssistantQuery } from "@/lib/assistant/nlp/parse-query";
import {
  resolveAnalyticsWindow,
  resolveLeadsSeoWindow,
} from "@/lib/assistant/nlp/windows";
import { ANALYTICS_MAX_RANGE_DAYS } from "@/lib/integrations/constants";
import { inclusiveDaySpan } from "@/lib/integrations/date.utils";

describe("assistant NLP engine", () => {
  it("loads wink-nlp and extracts lead + window entities", () => {
    expect(getAssistantNlp()).not.toBeNull();

    const entities = extractAssistantEntities("how many leads this month");
    const types = entities.map((entity) => entity.type);

    expect(types).toContain("domain.leads");
    expect(types).toContain("window.this_month");
  });

  it("still parses when relying on lexicon tokens after correction", () => {
    expect(parseAssistantQuery("how many leadss we got it?")).toMatchObject({
      kind: "leads_count",
    });
  });
});

describe("assistant windows", () => {
  const localNow = new Date(2026, 7, 13, 12, 0, 0);
  const utcNow = new Date(Date.UTC(2026, 7, 13, 12, 0, 0));

  it("defaults lead counts to this month in local time", () => {
    const range = resolveLeadsSeoWindow({ preset: null, lastNDays: null }, "this_month", localNow);
    expect(range.from).toBe("2026-08-01");
    expect(range.to).toBe("2026-08-13");
    expect(range.label).toBe("this month");
  });

  it("treats all-time leads as an unbounded Mongo range", () => {
    const range = resolveLeadsSeoWindow({ preset: "all", lastNDays: null }, "this_month", localNow);
    expect(range.from).toBeNull();
    expect(range.to).toBeNull();
    expect(range.label).toBe("all time");
  });

  it("defaults analytics to last 30 days ending UTC yesterday", () => {
    const range = resolveAnalyticsWindow({ preset: null, lastNDays: null }, utcNow);
    expect(range.from).toBe("2026-07-14");
    expect(range.to).toBe("2026-08-12");
    expect(range.label).toBe("the last 30 days");
  });

  it("clamps analytics all-time to 366 days ending UTC yesterday", () => {
    const range = resolveAnalyticsWindow({ preset: "all", lastNDays: null }, utcNow);
    expect(range.to).toBe("2026-08-12");
    expect(inclusiveDaySpan(range.from!, range.to!)).toBe(ANALYTICS_MAX_RANGE_DAYS);
  });
});
