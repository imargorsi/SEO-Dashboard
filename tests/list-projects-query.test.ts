import { describe, expect, it } from "vitest";

import {
  listProjectsQuerySchema,
  normalizeListProjectsStatus,
  parseListProjectsQuery,
} from "@/schemas/list-projects-query";

describe("listProjectsQuerySchema", () => {
  it("accepts project status filters", () => {
    for (const status of ["pending", "pending_approval", "active", "inactive", "rejected"] as const) {
      expect(listProjectsQuerySchema.parse({ status })).toEqual({ status });
    }
  });

  it("maps pending_approval to pending", () => {
    expect(normalizeListProjectsStatus("pending_approval")).toBe("pending");
    expect(normalizeListProjectsStatus("active")).toBe("active");
    expect(normalizeListProjectsStatus(undefined)).toBeUndefined();
  });

  it("parses query params", () => {
    const params = new URLSearchParams("status=pending_approval");
    expect(parseListProjectsQuery(params)).toEqual({ status: "pending_approval" });
  });

  it("rejects unknown status values", () => {
    const params = new URLSearchParams("status=approved");
    expect(() => parseListProjectsQuery(params)).toThrow();
  });
});
