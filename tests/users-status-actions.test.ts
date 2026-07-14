import { describe, expect, it } from "vitest";

import { hashPassword } from "@/lib/auth/password";
import { createAccessToken, findAccessToken } from "@/lib/auth/tokens";
import { authenticateLogin } from "@/lib/auth/login";
import { runApiGuards } from "@/lib/auth/run-api-guards";
import { ValidationError } from "@/lib/api/http-errors";
import { activateAdminUser, deactivateAdminUser } from "@/lib/users/user-status-actions";
import { User } from "@/models";
import { authContextFor } from "@/tests/helpers/project-test-utils";

function jsonRequest(url: string, init?: RequestInit): Request {
  return new Request(url, {
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
}

describe("User account status", () => {
  it("deactivates an active user and revokes tokens", async () => {
    const admin = await User.create({
      name: "Admin",
      email: "admin-status@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
      status: "active",
    });

    const target = await User.create({
      name: "Target User",
      email: "target-deactivate@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
      status: "active",
    });

    const token = await createAccessToken(target._id);
    expect(await findAccessToken(token)).not.toBeNull();

    const deactivated = await deactivateAdminUser(authContextFor(admin), target._id.toString());
    expect(deactivated.status).toBe("inactive");
    expect(await findAccessToken(token)).toBeNull();
  });

  it("activates an inactive user", async () => {
    const admin = await User.create({
      name: "Admin",
      email: "admin-activate-user@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
      status: "active",
    });

    const target = await User.create({
      name: "Inactive User",
      email: "target-activate@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
      status: "inactive",
    });

    const activated = await activateAdminUser(authContextFor(admin), target._id.toString());
    expect(activated.status).toBe("active");
  });

  it("rejects deactivating your own account", async () => {
    const admin = await User.create({
      name: "Self Admin",
      email: "self-deactivate@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
      status: "active",
    });

    await expect(deactivateAdminUser(authContextFor(admin), admin._id.toString())).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it("blocks login for inactive users", async () => {
    await User.create({
      name: "Inactive Login",
      email: "inactive-login@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
      status: "inactive",
    });

    const result = await authenticateLogin(
      "inactive-login@example.com",
      "password",
      jsonRequest("http://localhost/login"),
    );

    expect(result).toBeInstanceOf(Response);
    if (!(result instanceof Response)) return;
    expect(result.status).toBe(403);
  });

  it("blocks authenticated API access for inactive users", async () => {
    const user = await User.create({
      name: "Inactive Api",
      email: "inactive-api@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
      status: "inactive",
    });

    const token = await createAccessToken(user._id);
    const request = new Request("http://localhost/api/v1/users", {
      headers: { authorization: `Bearer ${token}` },
    });

    const result = await runApiGuards(request);
    expect(result).toBeInstanceOf(Response);
    if (!(result instanceof Response)) return;
    expect(result.status).toBe(403);
  });
});
