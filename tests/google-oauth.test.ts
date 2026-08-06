import { describe, expect, it } from "vitest";

import { hashPassword } from "@/lib/auth/password";
import { resolveUserFromGoogleProfile } from "@/lib/auth/google-oauth";
import { createOAuthLoginCode, consumeOAuthLoginCode, User } from "@/models";

describe("Google OAuth account linking", () => {
  it("creates a Google-only user when email is new", async () => {
    const result = await resolveUserFromGoogleProfile({
      sub: "google-sub-new-1",
      email: "new-google@example.com",
      email_verified: true,
      name: "New Google",
    });

    expect(result).not.toBeInstanceOf(Response);
    if (result instanceof Response) return;

    expect(result.email).toBe("new-google@example.com");
    expect(result.googleId).toBe("google-sub-new-1");
    expect(result.password).toBeNull();
    expect(result.emailVerifiedAt).toBeInstanceOf(Date);
  });

  it("links Google to an existing password account with the same email", async () => {
    const existing = await User.create({
      name: "Password User",
      email: "link-me@example.com",
      password: await hashPassword("password123"),
      emailVerifiedAt: null,
      roles: [],
    });

    const result = await resolveUserFromGoogleProfile({
      sub: "google-sub-link-1",
      email: "link-me@example.com",
      email_verified: true,
      name: "Password User",
    });

    expect(result).not.toBeInstanceOf(Response);
    if (result instanceof Response) return;

    expect(result._id.toString()).toBe(existing._id.toString());
    expect(result.googleId).toBe("google-sub-link-1");
    expect(result.hasPassword()).toBe(true);
    expect(result.emailVerifiedAt).toBeInstanceOf(Date);

    const count = await User.countDocuments({ email: "link-me@example.com" });
    expect(count).toBe(1);
  });

  it("logs in the same user when googleId already exists", async () => {
    const created = await resolveUserFromGoogleProfile({
      sub: "google-sub-repeat",
      email: "repeat@example.com",
      email_verified: true,
      name: "Repeat",
    });
    expect(created).not.toBeInstanceOf(Response);
    if (created instanceof Response) return;

    const again = await resolveUserFromGoogleProfile({
      sub: "google-sub-repeat",
      email: "repeat@example.com",
      email_verified: true,
      name: "Repeat",
    });

    expect(again).not.toBeInstanceOf(Response);
    if (again instanceof Response) return;
    expect(again._id.toString()).toBe(created._id.toString());
    expect(await User.countDocuments({ googleId: "google-sub-repeat" })).toBe(1);
  });

  it("rejects unverified Google emails", async () => {
    const result = await resolveUserFromGoogleProfile({
      sub: "google-sub-unverified",
      email: "unverified@example.com",
      email_verified: false,
      name: "Nope",
    });

    expect(result).toBeInstanceOf(Response);
    if (!(result instanceof Response)) return;
    expect(result.status).toBe(422);
  });

  it("exchanges a one-time OAuth code once", async () => {
    const user = await User.create({
      name: "Exchange",
      email: "exchange@example.com",
      password: null,
      googleId: "google-sub-exchange",
      emailVerifiedAt: new Date(),
    });

    const plain = await createOAuthLoginCode(user._id);
    const first = await consumeOAuthLoginCode(plain);
    const second = await consumeOAuthLoginCode(plain);

    expect(first?.toString()).toBe(user._id.toString());
    expect(second).toBeNull();
  });
});
