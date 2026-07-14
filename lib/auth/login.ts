import { ApiResponse } from "@/lib/api/response";
import { authMessages } from "@/lib/auth/messages";
import { loadUserAuthData } from "@/lib/auth/guards";
import { verifyPassword } from "@/lib/auth/password";
import { clearLoginAttempts, clientIp, ensureLoginNotRateLimited, recordLoginFailure } from "@/lib/auth/rate-limit";
import { createAccessToken } from "@/lib/auth/tokens";
import { serializeUser } from "@/lib/serializers/user";
import { isActiveUserStatus } from "@/lib/users/constants";
import { User, type UserDocument } from "@/models";
import { NextResponse } from "next/server";

export async function authenticateLogin(
  email: string,
  password: string,
  request: Request
): Promise<{ user: UserDocument } | NextResponse> {
  const ip = clientIp(request);
  const normalizedEmail = email.toLowerCase();

  const retryAfter = ensureLoginNotRateLimited(normalizedEmail, ip);
  if (retryAfter !== null) {
    return ApiResponse.validation(authMessages.throttle(retryAfter), {
      email: [authMessages.throttle(retryAfter)],
    });
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user || !(await verifyPassword(password, user.password))) {
    recordLoginFailure(normalizedEmail, ip);
    return ApiResponse.validation(authMessages.failed, {
      email: [authMessages.failed],
    });
  }

  if (!isActiveUserStatus(user.status)) {
    return ApiResponse.error(authMessages.inactiveAccount, {}, 403);
  }

  clearLoginAttempts(normalizedEmail, ip);
  return { user };
}

export async function buildLoginResponse(user: UserDocument): Promise<NextResponse> {
  const authData = await loadUserAuthData(user);
  const token = await createAccessToken(user._id, "api");

  return ApiResponse.success(
    {
      token,
      token_type: "Bearer",
      user: serializeUser(user, {
        ...authData,
        includeHomeApiPath: false,
      }),
    },
    authMessages.authenticated
  );
}

export async function sendEmailVerification(user: UserDocument): Promise<void> {
  const { createSignedVerificationUrl } = await import("@/lib/auth/signed-url");
  const { emailVerificationMailContent, sendMail } = await import("@/lib/mail/client");

  const url = createSignedVerificationUrl(user._id.toString(), user.getEmailForVerification());
  const mail = emailVerificationMailContent(url);
  await sendMail({ to: user.email, subject: mail.subject, text: mail.text });
}
