import { describe, expect, it } from "vitest";

import { parseListUsersQuery } from "@/schemas/list-users-query";

describe("listUsersQuerySchema", () => {
  it("defaults page, per_page, and newest", () => {
    expect(parseListUsersQuery(new URLSearchParams())).toEqual({
      page: 1,
      per_page: 15,
      newest: true,
    });
  });

  it("parses search, pagination, and newest params", () => {
    const params = new URLSearchParams("page=2&per_page=25&search=Jane&newest=false");
    expect(parseListUsersQuery(params)).toEqual({
      page: 2,
      per_page: 25,
      search: "Jane",
      newest: false,
    });
  });

  it("ignores blank search", () => {
    const params = new URLSearchParams("search=%20%20");
    expect(parseListUsersQuery(params)).toEqual({
      page: 1,
      per_page: 15,
      newest: true,
    });
  });
});
