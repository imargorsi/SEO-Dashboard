import { NextResponse } from "next/server";

import { ValidationError } from "@/lib/api/http-errors";
import { ApiResponse } from "@/lib/api/response";
import { hashPassword } from "@/lib/auth/password";
import { storeProfileImageFile } from "@/lib/auth/profile-image-storage";
import { serializeAdminUserListItem } from "@/lib/serializers/admin-user";
import { User, type UserDocument } from "@/models";
import type { CreateUserInput } from "@/schemas/create-user";

export async function createUser(
  input: CreateUserInput,
  options?: { profileImageFile?: File | null },
): Promise<{ user: UserDocument }> {
  const email = input.email;
  const existing = await User.findOne({ email });

  if (existing) {
    throw ValidationError.fromFieldErrors({
      email: ["The Email Has Already Been Taken."],
    });
  }

  const user = await User.create({
    name: input.name.trim(),
    email,
    password: await hashPassword(input.password),
    emailVerifiedAt: new Date(),
    // Platform-only; project roles are assigned via project_members (invite flow).
    roles: [],
    status: "active",
    profileImage: null,
  });

  if (options?.profileImageFile) {
    try {
      const path = await storeProfileImageFile(user._id.toString(), options.profileImageFile);
      user.profileImage = path;
      await user.save();
    } catch (error) {
      console.error("Profile Image Upload Failed", error);
      throw ValidationError.fromFieldErrors({
        profile_image: ["Profile Image Upload Is Currently Unavailable On This Deployment."],
      });
    }
  }

  return { user };
}

export function buildCreateUserResponse(user: UserDocument): NextResponse {
  return ApiResponse.success(
    serializeAdminUserListItem(user, []),
    "User Created Successfully.",
    201,
  );
}
