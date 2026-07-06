import { withApiHandler } from "@/lib/api/handler";
import { requireAuth } from "@/lib/auth/guards";
import { updateProfile } from "@/lib/auth/update-profile";
import { connectDb } from "@/lib/db/mongoose";

export const POST = withApiHandler(async (request) => {
  await connectDb();
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  const formData = await request.formData();
  const nameField = formData.get("name");
  const fileField = formData.get("profile_image");

  return updateProfile(auth.user, {
    ...(typeof nameField === "string" && nameField.trim() ? { name: nameField.trim() } : {}),
    ...(fileField instanceof File && fileField.size > 0 ? { profile_image_file: fileField } : {}),
  });
});
