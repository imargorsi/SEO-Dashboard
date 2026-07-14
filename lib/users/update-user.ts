import { NextResponse } from "next/server";

import { ValidationError } from "@/lib/api/http-errors";
import { ApiResponse } from "@/lib/api/response";
import { hashPassword } from "@/lib/auth/password";
import {
  deleteStoredProfileImage,
  storeProfileImageFile,
} from "@/lib/auth/profile-image-storage";
import { serializeAdminUserDetail } from "@/lib/serializers/admin-user";
import { isActiveUserStatus } from "@/lib/users/constants";
import { getAdminUserById } from "@/lib/users/get-user";
import { User, type UserDocument } from "@/models";
import type { UpdateUserInput } from "@/schemas/create-user";

export async function updateAdminUser(
  userId: string,
  input: UpdateUserInput,
  options?: { profileImageFile?: File | null },
): Promise<{ user: UserDocument }> {
  const user = await getAdminUserById(userId);
  const email = input.email;
  const statusToKeep = isActiveUserStatus(user.status) ? "active" : "inactive";

  const emailTaken = await User.findOne({ email, _id: { $ne: user._id } }).select("_id");
  if (emailTaken) {
    throw ValidationError.fromFieldErrors({
      email: ["The Email Has Already Been Taken."],
    });
  }

  user.name = input.name.trim();
  user.email = email;

  if (input.password) {
    user.password = await hashPassword(input.password);
  }

  if (options?.profileImageFile) {
    try {
      const previousProfileImage = user.profileImage;
      const path = await storeProfileImageFile(user._id.toString(), options.profileImageFile);
      user.profileImage = path;
      if (previousProfileImage) {
        await deleteStoredProfileImage(previousProfileImage).catch(() => undefined);
      }
    } catch (error) {
      console.error("Profile Image Upload Failed", error);
      throw ValidationError.fromFieldErrors({
        profile_image: ["Profile Image Upload Is Currently Unavailable On This Deployment."],
      });
    }
  }

  await user.save();
  // Preserve account status even if a stale HMR schema omitted the path on save.
  await User.collection.updateOne({ _id: user._id }, { $set: { status: statusToKeep } });
  user.status = statusToKeep;

  return { user };
}

export function buildUpdateAdminUserResponse(user: UserDocument): NextResponse {
  return ApiResponse.success(serializeAdminUserDetail(user), "User Updated Successfully.");
}
