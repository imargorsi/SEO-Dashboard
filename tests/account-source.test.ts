import { describe, expect, it } from "vitest";

import {
  ACCOUNT_SOURCE_ADMIN_VERIFY_WINDOW_MS,
  inferAccountSource,
  resolveAccountSource,
} from "@/lib/users/account-source";

describe("account-source", () => {
  const createdAt = new Date("2026-01-01T12:00:00.000Z");

  it("infers google from googleId", () => {
    expect(
      inferAccountSource({
        googleId: "google-sub",
        emailVerifiedAt: createdAt,
        createdAt,
      }),
    ).toBe("google");
  });

  it("infers self_register when email is unverified", () => {
    expect(
      inferAccountSource({
        emailVerifiedAt: null,
        createdAt,
      }),
    ).toBe("self_register");
  });

  it("infers admin when verified within the create window", () => {
    expect(
      inferAccountSource({
        emailVerifiedAt: new Date(createdAt.getTime() + 1_000),
        createdAt,
      }),
    ).toBe("admin");
  });

  it("infers self_register when verified after the create window", () => {
    expect(
      inferAccountSource({
        emailVerifiedAt: new Date(
          createdAt.getTime() + ACCOUNT_SOURCE_ADMIN_VERIFY_WINDOW_MS + 1,
        ),
        createdAt,
      }),
    ).toBe("self_register");
  });

  it("prefers stored known source over inference", () => {
    expect(
      resolveAccountSource({
        accountSource: "admin",
        googleId: "google-sub",
        emailVerifiedAt: null,
        createdAt,
      }),
    ).toBe("admin");
  });
});
