import { z } from "zod";

import { FONT_PACK_IDS, THEME_PACK_IDS } from "@/lib/theme/pack-ids";

export const userPreferencesSchema = z.object({
  theme_pack: z.enum(THEME_PACK_IDS),
  font_pack: z.enum(FONT_PACK_IDS),
});

export const updateUserPreferencesSchema = z
  .object({
    theme_pack: z.enum(THEME_PACK_IDS).optional(),
    font_pack: z.enum(FONT_PACK_IDS).optional(),
  })
  .refine((body) => body.theme_pack !== undefined || body.font_pack !== undefined, {
    message: "Provide Theme Pack Or Font Pack.",
  });

export type TUserPreferences = z.infer<typeof userPreferencesSchema>;
export type TUpdateUserPreferencesInput = z.infer<typeof updateUserPreferencesSchema>;
