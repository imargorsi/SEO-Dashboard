import type { UserDocument } from "@/models";
import { NextResponse } from "next/server";

import { ApiResponse } from "@/lib/api/response";
import { authMessages } from "@/lib/auth/messages";
import { loadUserAuthData } from "@/lib/auth/guards";
import {
  deleteStoredProfileImage,
  storeProfileImageFile,
  validateProfileImageFile,
} from "@/lib/auth/profile-image-storage";
import { serializeUser } from "@/lib/serializers/user";

export type UpdateProfileInput = {
  name?: string;
  profile_image_file?: File;
};

export async function updateProfile(
  user: UserDocument,
  input: UpdateProfileInput
): Promise<NextResponse> {
  if (!input.name && !input.profile_image_file) {
    return ApiResponse.validation(authMessages.profileEmptyUpdate, {
      profile: [authMessages.profileEmptyUpdate],
    });
  }

  if (input.profile_image_file) {
    const validationMessage = validateProfileImageFile(input.profile_image_file);
    if (validationMessage) {
      return ApiResponse.validation(validationMessage, { profile_image: [validationMessage] });
    }

    if (user.profileImage) {
      await deleteStoredProfileImage(user.profileImage);
    }

    user.profileImage = await storeProfileImageFile(user._id.toString(), input.profile_image_file);
  }

  if (input.name !== undefined) {
    user.name = input.name;
  }

  await user.save();

  const authData = loadUserAuthData(user);
  const payload = serializeUser(user, { ...authData, includeHomeApiPath: true });

  return ApiResponse.success(payload, authMessages.profileUpdateSuccess);
}
