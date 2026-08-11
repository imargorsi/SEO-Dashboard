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

  it("parses search, pagination, newest, status, and account_source params", () => {
    const params = new URLSearchParams(
      "page=2&per_page=25&search=Jane&newest=false&status=inactive&account_source=admin",
    );
    expect(parseListUsersQuery(params)).toEqual({
      page: 2,
      per_page: 25,
      search: "Jane",
      newest: false,
      status: "inactive",
      account_source: "admin",
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

  it("rejects unknown account_source (not a list filter)", () => {
    expect(() =>
      parseListUsersQuery(new URLSearchParams("account_source=unknown")),
    ).toThrow();
  });
});
