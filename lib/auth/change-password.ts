import type { UserDocument } from "@/models";
import { NextResponse } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import { authMessages } from "@/lib/auth/messages";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export async function changePassword(
  user: UserDocument,
  input: { current_password: string; new_password: string }
): Promise<NextResponse> {
  const currentOk = await verifyPassword(input.current_password, user.password);
  if (!currentOk) {
    return ApiResponse.validation(
      authMessages.passwordChangeInvalidCurrentPassword,
      { current_password: [authMessages.passwordChangeInvalidCurrentPassword] }
    );
  }

  user.password = await hashPassword(input.new_password);
  await user.save();

  return ApiResponse.success(null, authMessages.changePasswordSuccess);
}