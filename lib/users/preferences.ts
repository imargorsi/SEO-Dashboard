import { resolveFontPackId, resolveThemePackId } from "@/lib/theme/pack-ids";
import type { UserDocument } from "@/models/User";
import type { TUpdateUserPreferencesInput, TUserPreferences } from "@/schemas/preferences";

export function serializeUserPreferences(user: UserDocument): TUserPreferences {
  return {
    theme_pack: resolveThemePackId(user.themePack),
    font_pack: resolveFontPackId(user.fontPack),
  };
}

export async function updateUserPreferences(
  user: UserDocument,
  input: TUpdateUserPreferencesInput,
): Promise<TUserPreferences> {
  if (input.theme_pack !== undefined) {
    user.themePack = input.theme_pack;
  }
  if (input.font_pack !== undefined) {
    user.fontPack = input.font_pack;
  }

  await user.save();
  return serializeUserPreferences(user);
}
