import { describe, expect, it } from "vitest";

import { mapCsvRows, parseSheetDate } from "@/lib/seo-activities/column-mapper";
import { parseCsv } from "@/lib/seo-activities/parse-csv";

describe("parseCsv", () => {
  it("parses quoted fields with commas and escaped quotes", () => {
    const rows = parseCsv(`"Days","Site","Title"\n"Monday","MTC","Hello, ""World"""\n`);
    expect(rows).toEqual([
      ["Days", "Site", "Title"],
      ["Monday", "MTC", 'Hello, "World"'],
    ]);
  });
});

describe("mapCsvRows", () => {
  it("maps blog headers and keeps site names", () => {
    const rows = mapCsvRows([
      ["Days", "Site", "Title", "Blog Link", "Publication Date"],
      [
        "Monday",
        "mtc",
        "Example Title",
        "https://example.com/post",
        "02-Jun-2026",
      ],
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      sourceRowNumber: 2,
      siteName: "mtc",
      title: "Example Title",
      url: "https://example.com/post",
      occurredOnRaw: "02-Jun-2026",
    });
    expect(rows[0]).not.toHaveProperty("day");
    expect(rows[0]!.occurredOn?.toISOString().startsWith("2026-06-02")).toBe(true);
  });

  it("maps GP backlink aliases", () => {
    const rows = mapCsvRows([
      ["Days", "site", "BackLinks", "Anchor text", "Publication Date"],
      ["Tuesday", "Pets", "https://example.com", "Anchor", "03-Jun-2026"],
    ]);

    expect(rows[0]).toMatchObject({
      siteName: "Pets",
      url: "https://example.com",
      anchorText: "Anchor",
    });
  });

  it("requires a site column", () => {
    expect(() => mapCsvRows([["Days", "Title"], ["Monday", "X"]])).toThrow(
      /Site Column/i,
    );
  });
});

describe("parseSheetDate", () => {
  it("parses day-mon-year sheet dates", () => {
    expect(parseSheetDate("02-Jun-2026")?.toISOString()).toBe("2026-06-02T00:00:00.000Z");
  });

  it("returns null for blank values", () => {
    expect(parseSheetDate(null)).toBeNull();
    expect(parseSheetDate("")).toBeNull();
  });
});
