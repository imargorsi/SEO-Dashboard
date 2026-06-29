import crypto from "crypto";
import { authMessages } from "@/lib/auth/messages";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { env } from "@/lib/config/env";
import {
  passwordResetMailContent,
  sendMail,
} from "@/lib/mail/client";
import { revokeAllUserTokens } from "@/lib/auth/tokens";
import { PasswordResetToken, User } from "@/models";
import { ApiResponse } from "@/lib/api/response";
import { NextResponse } from "next/server";

function randomResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function sendPasswordResetLink(email: string): Promise<NextResponse> {
  const user = await User.findOne({ email });
  if (!user) {
    return ApiResponse.error(
      authMessages.passwordResetUserNotFound,
      { email: [authMessages.passwordResetUserNotFound] },
      422,
    );
  }

  const existing = await PasswordResetToken.findOne({ email });
  if (existing) {
    const throttleMs = env.passwordResetThrottleSeconds() * 1000;
    const elapsed = Date.now() - existing.createdAt.getTime();
    if (elapsed < throttleMs) {
      const seconds = env.passwordResetThrottleSeconds();
      return ApiResponse.error(authMessages.passwordResetThrottled(seconds), {}, 429);
    }
  }

  const plainToken = randomResetToken();
  const tokenHash = await hashPassword(plainToken);

  await PasswordResetToken.findOneAndUpdate(
    { email },
    { email, tokenHash, createdAt: new Date() },
    { upsert: true, returnDocument: "after" },
  );

  const resetUrl = `${env.frontendUrl().replace(/\/$/, "")}/reset-password?${new URLSearchParams({
    token: plainToken,
    email,
  }).toString()}`;

  const mail = passwordResetMailContent(resetUrl, env.passwordResetExpireMinutes());

  try {
    await sendMail({
      to: email,
      subject: mail.subject,
      text: mail.text,
    });
  } catch (error) {
    console.error(error);
    return ApiResponse.error(authMessages.passwordResetUnableToSend, {}, 503);
  }

  return ApiResponse.success(null, authMessages.passwordResetSent, 202);
}

export async function resetPassword(input: {
  email: string;
  token: string;
  password: string;
}): Promise<NextResponse> {
  const record = await PasswordResetToken.findOne({ email: input.email });
  if (!record) {
    return ApiResponse.error(authMessages.passwordResetInvalidToken, {}, 422);
  }

  const expireMs = env.passwordResetExpireMinutes() * 60 * 1000;
  if (Date.now() - record.createdAt.getTime() > expireMs) {
    await PasswordResetToken.deleteOne({ email: input.email });
    return ApiResponse.error(authMessages.passwordResetInvalidToken, {}, 422);
  }

  const tokenValid = await verifyPassword(input.token, record.tokenHash);
  if (!tokenValid) {
    return ApiResponse.error(authMessages.passwordResetInvalidToken, {}, 422);
  }

  const user = await User.findOne({ email: input.email });
  if (!user) {
    return ApiResponse.error(authMessages.passwordResetInvalidToken, {}, 422);
  }

  user.password = await hashPassword(input.password);
  await user.save();
  await revokeAllUserTokens(user._id);
  await PasswordResetToken.deleteOne({ email: input.email });

  return ApiResponse.success(null, authMessages.passwordResetSuccess);
}
