import { describe, expect, it } from "vitest";
import { hashPassword } from "@/lib/auth/password";
import { createAccessToken, findAccessToken, revokeAccessToken } from "@/lib/auth/tokens";
import { loadUserAuthData } from "@/lib/auth/guards";
import { COMPANY_ADMIN_ROLE, SUPER_ADMIN_ROLE } from "@/lib/auth/rbac";
import { authenticateLogin, buildLoginResponse } from "@/lib/auth/login";
import { sendPasswordResetLink, resetPassword } from "@/lib/auth/password-reset";
import { User } from "@/models";
import { createSignedVerificationUrl, hasValidSignature } from "@/lib/auth/signed-url";

function jsonRequest(url: string, init?: RequestInit): Request {
  return new Request(url, {
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
}

describe("Auth API parity", () => {
  it("login returns bearer token and user shape", async () => {
    const user = await User.create({
      name: "Admin",
      email: "admin@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [SUPER_ADMIN_ROLE],
    });

    const result = await authenticateLogin("admin@example.com", "password", jsonRequest("http://localhost/login"));
    expect(result).not.toBeInstanceOf(Response);
    if (result instanceof Response) return;

    const response = await buildLoginResponse(result.user);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.token_type).toBe("Bearer");
    expect(body.data.token).toBeTruthy();
    expect(body.data.user.email).toBe("admin@example.com");
    expect(body.data.user.roles).toContain(SUPER_ADMIN_ROLE);
    expect(body.data.user.permissions).toContain("admin.dashboard.view");
    expect(body.data.user.home_api_path).toBeUndefined();
  });

  it("rejects invalid password", async () => {
    await User.create({
      name: "User",
      email: "user@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
    });

    const result = await authenticateLogin("user@example.com", "wrong", jsonRequest("http://localhost/login"));
    expect(result).toBeInstanceOf(Response);
    if (!(result instanceof Response)) return;
    const body = await result.json();
    expect(body.success).toBe(false);
    expect(body.errors.email).toBeDefined();
  });

  it("logout revokes current token", async () => {
    const user = await User.create({
      name: "User",
      email: "logout@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
    });
    const token = await createAccessToken(user._id);
    expect(await findAccessToken(token)).not.toBeNull();
    await revokeAccessToken(token);
    expect(await findAccessToken(token)).toBeNull();
  });

  it("registers user with empty roles and sends verification", async () => {
    const { registerUser, buildRegisterResponse } = await import("@/lib/auth/register");

    const result = await registerUser({
      name: "Pat Example",
      email: "pat@example.com",
      password: "Password1!",
    });

    expect(result).not.toBeInstanceOf(Response);
    if (result instanceof Response) return;

    expect(result.user.roles).toEqual([]);
    expect(result.user.emailVerifiedAt).toBeNull();
    expect(result.user.name).toBe("Pat Example");

    const response = await buildRegisterResponse(result.user);
    const body = await response.json();
    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.email).toBe("pat@example.com");
    expect(body.data.company_id).toBeNull();

    const login = await authenticateLogin("pat@example.com", "Password1!", jsonRequest("http://localhost/login"));
    expect(login).not.toBeInstanceOf(Response);
  });

  it("password reset flow updates password and revokes tokens", async () => {
    const user = await User.create({
      name: "Reset User",
      email: "reset@example.com",
      password: await hashPassword("old-password"),
      emailVerifiedAt: new Date(),
    });
    await createAccessToken(user._id);

    const forgot = await sendPasswordResetLink("reset@example.com");
    expect(forgot.status).toBe(202);

    const record = await import("@/models").then((m) => m.PasswordResetToken.findOne({ email: "reset@example.com" }));
    expect(record).not.toBeNull();

    const crypto = await import("crypto");
    const plain = crypto.randomBytes(32).toString("hex");
    record!.tokenHash = await hashPassword(plain);
    await record!.save();

    const reset = await resetPassword({
      email: "reset@example.com",
      token: plain,
      password: "New-password-1",
    });
    const resetBody = await reset.json();
    expect(reset.status).toBe(200);
    expect(resetBody.success).toBe(true);

    const fresh = await User.findById(user._id);
    const { verifyPassword } = await import("@/lib/auth/password");
    expect(await verifyPassword("New-password-1", fresh!.password)).toBe(true);

    const { AccessToken } = await import("@/models");
    expect(await AccessToken.countDocuments({ userId: user._id })).toBe(0);
  });

  it("email verification signed url validates and verifies user", async () => {
    const user = await User.create({
      name: "Verify",
      email: "verify@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: null,
    });

    const url = createSignedVerificationUrl(user._id.toString(), user.email);
    expect(hasValidSignature(url)).toBe(true);

    const request = new Request(url);
    const { GET } = await import("@/app/email/verify/[id]/[hash]/route");
    const response = await GET(request, {
      params: Promise.resolve({
        id: user._id.toString(),
        hash: (await import("@/lib/auth/signed-url")).emailVerificationHash(user.email),
      }),
    });

    expect(response.status).toBe(302);
    const fresh = await User.findById(user._id);
    expect(fresh!.emailVerifiedAt).not.toBeNull();
  });

  it("derives permissions from embedded user roles", async () => {
    const user = await User.create({
      name: "Company Admin",
      email: "ca@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [COMPANY_ADMIN_ROLE],
    });

    const authData = loadUserAuthData(user);
    expect(authData.roles).toContain(COMPANY_ADMIN_ROLE);
    expect(authData.permissions).toContain("company.dashboard.view");
  });
});
