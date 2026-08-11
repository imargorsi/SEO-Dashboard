import crypto from "crypto";
import { google } from "googleapis";
import { NextResponse } from "next/server";

import { ApiResponse } from "@/lib/api/response";
import { buildLoginResponse } from "@/lib/auth/login";
import { authMessages } from "@/lib/auth/messages";
import { env } from "@/lib/config/env";
import { isActiveUserStatus } from "@/lib/users/constants";
import { createOAuthLoginCode, consumeOAuthLoginCode, User, type UserDocument } from "@/models";

const GOOGLE_SCOPES = ["openid", "email", "profile"] as const;

type TGoogleIdTokenPayload = {
  sub: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  picture?: string;
};

function appKeyBytes(): Buffer {
  const key = env.appKey();
  if (key.startsWith("base64:")) {
    return Buffer.from(key.slice("base64:".length), "base64");
  }
  return Buffer.from(key);
}

function createOAuthClient() {
  if (!env.googleOAuthConfigured()) {
    throw new Error(authMessages.googleOAuthNotConfigured);
  }
  return new google.auth.OAuth2(
    env.googleOAuthClientId(),
    env.googleOAuthClientSecret(),
    env.googleOAuthRedirectUri(),
  );
}

/** Signed CSRF state for the OAuth round-trip (HMAC with APP_KEY). */
export function createGoogleOAuthState(): string {
  const nonce = crypto.randomBytes(16).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + 10 * 60;
  const payload = `${nonce}.${exp}`;
  const sig = crypto.createHmac("sha256", appKeyBytes()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyGoogleOAuthState(state: string | null): boolean {
  if (!state) return false;
  const parts = state.split(".");
  if (parts.length !== 3) return false;
  const [nonce, expRaw, sig] = parts;
  if (!nonce || !expRaw || !sig) return false;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  const payload = `${nonce}.${expRaw}`;
  const expected = crypto.createHmac("sha256", appKeyBytes()).update(payload).digest("base64url");
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function buildGoogleAuthorizationUrl(): string {
  const client = createOAuthClient();
  return client.generateAuthUrl({
    access_type: "online",
    prompt: "select_account",
    scope: [...GOOGLE_SCOPES],
    state: createGoogleOAuthState(),
    include_granted_scopes: true,
  });
}

function isEmailVerifiedFlag(value: boolean | string | undefined): boolean {
  return value === true || value === "true";
}

/**
 * Resolve a single Crawllex user from Google identity.
 * - Match `googleId` (sub) first — never create a duplicate Google link.
 * - Else match unique email and link `googleId` (Google verified email proves ownership).
 * - Else create a Google-only user (password null, email verified).
 */
export async function resolveUserFromGoogleProfile(
  profile: TGoogleIdTokenPayload,
): Promise<UserDocument | NextResponse> {
  const googleId = profile.sub?.trim();
  const email = profile.email?.trim().toLowerCase();

  if (!googleId || !email) {
    return ApiResponse.error(authMessages.googleOAuthFailed, {}, 422);
  }

  if (!isEmailVerifiedFlag(profile.email_verified)) {
    return ApiResponse.error(authMessages.googleOAuthEmailUnverified, {}, 422);
  }

  const byGoogleId = await User.findOne({ googleId });
  if (byGoogleId) {
    if (byGoogleId.email !== email) {
      // Rare Google email change: keep googleId as source of truth; sync email if free.
      const emailTaken = await User.findOne({ email, _id: { $ne: byGoogleId._id } });
      if (!emailTaken) {
        byGoogleId.email = email;
      }
    }
    if (!byGoogleId.emailVerifiedAt) {
      byGoogleId.emailVerifiedAt = new Date();
    }
    if (!byGoogleId.profileImage && profile.picture) {
      byGoogleId.profileImage = profile.picture;
    }
    if (profile.name?.trim() && !byGoogleId.name?.trim()) {
      byGoogleId.name = profile.name.trim();
    }
    await byGoogleId.save();
    return byGoogleId;
  }

  const byEmail = await User.findOne({ email });
  if (byEmail) {
    if (byEmail.googleId && byEmail.googleId !== googleId) {
      // Should not happen with unique googleId; treat as conflict.
      return ApiResponse.error(authMessages.googleOAuthFailed, {}, 409);
    }
    byEmail.googleId = googleId;
    if (!byEmail.emailVerifiedAt) {
      byEmail.emailVerifiedAt = new Date();
    }
    if (!byEmail.profileImage && profile.picture) {
      byEmail.profileImage = profile.picture;
    }
    await byEmail.save();
    return byEmail;
  }

  const user = await User.create({
    name: profile.name?.trim() || email.split("@")[0] || "User",
    email,
    password: null,
    googleId,
    emailVerifiedAt: new Date(),
    profileImage: profile.picture ?? null,
    roles: [],
    status: "active",
    accountSource: "google",
  });

  return user;
}

export async function handleGoogleOAuthCallback(input: {
  code: string | null;
  state: string | null;
}): Promise<NextResponse> {
  const frontend = env.frontendUrl().replace(/\/$/, "");
  const failRedirect = (message: string) =>
    NextResponse.redirect(
      `${frontend}/?google_error=${encodeURIComponent(message)}`,
    );

  if (!env.googleOAuthConfigured()) {
    return failRedirect(authMessages.googleOAuthNotConfigured);
  }

  if (!verifyGoogleOAuthState(input.state)) {
    return failRedirect(authMessages.googleOAuthStateInvalid);
  }

  if (!input.code) {
    return failRedirect(authMessages.googleOAuthFailed);
  }

  try {
    const client = createOAuthClient();
    const { tokens } = await client.getToken(input.code);
    client.setCredentials(tokens);

    const ticket = tokens.id_token
      ? await client.verifyIdToken({
          idToken: tokens.id_token,
          audience: env.googleOAuthClientId(),
        })
      : null;

    let profile: TGoogleIdTokenPayload | null = ticket?.getPayload()
      ? (ticket.getPayload() as TGoogleIdTokenPayload)
      : null;

    if (!profile?.sub || !profile.email) {
      const oauth2 = google.oauth2({ version: "v2", auth: client });
      const { data } = await oauth2.userinfo.get();
      profile = {
        sub: String(data.id ?? ""),
        email: data.email ?? undefined,
        email_verified: data.verified_email ?? undefined,
        name: data.name ?? undefined,
        picture: data.picture ?? undefined,
      };
    }

    if (!profile?.sub || !profile.email) {
      return failRedirect(authMessages.googleOAuthFailed);
    }

    const resolved = await resolveUserFromGoogleProfile(profile);
    if (resolved instanceof NextResponse) {
      const body = await resolved.json().catch(() => null);
      const message =
        typeof body?.message === "string" ? body.message : authMessages.googleOAuthFailed;
      return failRedirect(message);
    }

    if (!isActiveUserStatus(resolved.status)) {
      return failRedirect(authMessages.googleOAuthAccountInactive);
    }

    const exchangeCode = await createOAuthLoginCode(resolved._id);
    return NextResponse.redirect(
      `${frontend}/auth/google/callback?code=${encodeURIComponent(exchangeCode)}`,
    );
  } catch {
    return failRedirect(authMessages.googleOAuthFailed);
  }
}

export async function exchangeGoogleOAuthCode(plainCode: string): Promise<NextResponse> {
  const userId = await consumeOAuthLoginCode(plainCode.trim());
  if (!userId) {
    return ApiResponse.error(authMessages.googleOAuthExchangeInvalid, {}, 422);
  }

  const user = await User.findById(userId);
  if (!user) {
    return ApiResponse.error(authMessages.googleOAuthExchangeInvalid, {}, 422);
  }

  if (!isActiveUserStatus(user.status)) {
    return ApiResponse.error(authMessages.googleOAuthAccountInactive, {}, 403);
  }

  return buildLoginResponse(user);
}

export function googleOAuthStartResponse(): NextResponse {
  if (!env.googleOAuthConfigured()) {
    return ApiResponse.error(authMessages.googleOAuthNotConfigured, {}, 503);
  }
  return NextResponse.redirect(buildGoogleAuthorizationUrl());
}
