import { describe, expect, it } from "vitest";

import {
  buildSpreadsheetEditUrl,
  extractSpreadsheetId,
  normalizeSpreadsheetUrl,
} from "@/lib/seo-activities/spreadsheet-url.utils";

describe("spreadsheet url utils", () => {
  it("extracts id from edit urls", () => {
    expect(
      extractSpreadsheetId(
        "https://docs.google.com/spreadsheets/d/1aCBQ30d9r3VSUbVxlrq4HC4t8x2CZaNCqjKehSgAXU4/edit?gid=0#gid=0",
      ),
    ).toBe("1aCBQ30d9r3VSUbVxlrq4HC4t8x2CZaNCqjKehSgAXU4");
  });

  it("accepts bare spreadsheet ids", () => {
    expect(extractSpreadsheetId("1aCBQ30d9r3VSUbVxlrq4HC4t8x2CZaNCqjKehSgAXU4")).toBe(
      "1aCBQ30d9r3VSUbVxlrq4HC4t8x2CZaNCqjKehSgAXU4",
    );
  });

  it("normalizes to a stable edit url", () => {
    expect(
      normalizeSpreadsheetUrl(
        "https://docs.google.com/spreadsheets/d/1aCBQ30d9r3VSUbVxlrq4HC4t8x2CZaNCqjKehSgAXU4/edit#gid=1",
      ),
    ).toEqual({
      spreadsheetId: "1aCBQ30d9r3VSUbVxlrq4HC4t8x2CZaNCqjKehSgAXU4",
      spreadsheetUrl: buildSpreadsheetEditUrl("1aCBQ30d9r3VSUbVxlrq4HC4t8x2CZaNCqjKehSgAXU4"),
    });
  });
});
