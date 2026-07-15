import { describe, expect, it } from "vitest";

import { parseListRolesQuery } from "@/schemas/list-roles-query";

describe("listRolesQuerySchema", () => {
  it("defaults page, per_page, and newest", () => {
    expect(parseListRolesQuery(new URLSearchParams())).toEqual({
      page: 1,
      per_page: 15,
      newest: true,
    });
  });

  it("parses search, pagination, newest, and status params", () => {
    const params = new URLSearchParams("page=2&per_page=25&search=owner&newest=false&status=inactive");
    expect(parseListRolesQuery(params)).toEqual({
      page: 2,
      per_page: 25,
      search: "owner",
      newest: false,
      status: "inactive",
    });
  });

  it("ignores blank search", () => {
    const params = new URLSearchParams("search=%20%20");
    expect(parseListRolesQuery(params)).toEqual({
      page: 1,
      per_page: 15,
      newest: true,
    });
  });
});
