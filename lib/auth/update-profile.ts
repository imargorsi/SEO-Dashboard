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
import {
  DISPLAY_NAME_MAX_LENGTH,
  DISPLAY_NAME_MAX_MESSAGE,
} from "@/lib/validation/display-name";

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

  let nextProfileImagePath: string | null = null;

  if (input.profile_image_file) {
    const validationMessage = validateProfileImageFile(input.profile_image_file);
    if (validationMessage) {
      return ApiResponse.validation(validationMessage, { profile_image: [validationMessage] });
    }

    try {
      nextProfileImagePath = await storeProfileImageFile(user._id.toString(), input.profile_image_file);
    } catch (error) {
      console.error("Profile Image Upload Failed", error);
      const message = "Profile image upload is currently unavailable on this deployment.";
      return ApiResponse.error(message, { profile_image: [message] }, 503);
    }
  }

  if (input.name !== undefined) {
    const trimmedName = input.name.trim();
    if (!trimmedName) {
      return ApiResponse.validation("Name Is Required.", { name: ["Name Is Required."] });
    }
    if (trimmedName.length > DISPLAY_NAME_MAX_LENGTH) {
      return ApiResponse.validation(DISPLAY_NAME_MAX_MESSAGE, {
        name: [DISPLAY_NAME_MAX_MESSAGE],
      });
    }
    user.name = trimmedName;
  }

  if (nextProfileImagePath) {
    const previousProfileImage = user.profileImage;
    user.profileImage = nextProfileImagePath;
    if (previousProfileImage) {
      await deleteStoredProfileImage(previousProfileImage).catch(() => undefined);
    }
  }

  await user.save();

  const authData = await loadUserAuthData(user);
  const payload = serializeUser(user, { ...authData, includeHomeApiPath: true });

  return ApiResponse.success(payload, authMessages.profileUpdateSuccess);
}
