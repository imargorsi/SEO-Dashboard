"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { baseQuery } from "@/lib/frontend/api/base";
import { getAccessToken } from "@/lib/frontend/auth/session";
import {
  applyFontPackToDocument,
  readStoredFontPack,
  writeStoredFontPack,
} from "@/lib/frontend/theme/font-packs";
import {
  applyThemePackToDocument,
  readStoredThemePack,
  writeStoredThemePack,
} from "@/lib/frontend/theme/theme-packs";
import type { TUpdateUserPreferencesInput, TUserPreferences } from "@/schemas/preferences";

const preferencesApi = {
  reducerPath: "preferences-api" as const,
};

export const preferencesKeys = {
  all: [preferencesApi.reducerPath] as const,
  detail: () => [...preferencesKeys.all, "me"] as const,
};

async function fetchPreferences(): Promise<TUserPreferences> {
  const envelope = await baseQuery.get<TUserPreferences>("me/preferences");
  return envelope.data;
}

async function patchPreferences(input: TUpdateUserPreferencesInput): Promise<TUserPreferences> {
  const envelope = await baseQuery.patch<TUserPreferences>("me/preferences", input);
  return envelope.data;
}

/** Apply server prefs to localStorage + document (keeps bootstrap / providers in sync). */
export function applyPreferencesLocally(prefs: TUserPreferences): void {
  writeStoredThemePack(prefs.theme_pack);
  applyThemePackToDocument(prefs.theme_pack);
  writeStoredFontPack(prefs.font_pack);
  applyFontPackToDocument(prefs.font_pack);
}

function readLocalPreferencesSnapshot(): TUserPreferences {
  return {
    theme_pack: readStoredThemePack(),
    font_pack: readStoredFontPack(),
  };
}

export function useUserPreferencesQuery(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? Boolean(getAccessToken());

  return useQuery({
    queryKey: preferencesKeys.detail(),
    queryFn: async () => {
      const prefs = await fetchPreferences();
      applyPreferencesLocally(prefs);
      return prefs;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useUpdateUserPreferencesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchPreferences,
    onMutate: async (input) => {
      const previous = readLocalPreferencesSnapshot();

      if (input.theme_pack) {
        writeStoredThemePack(input.theme_pack);
        applyThemePackToDocument(input.theme_pack);
      }
      if (input.font_pack) {
        writeStoredFontPack(input.font_pack);
        applyFontPackToDocument(input.font_pack);
      }

      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        applyPreferencesLocally(context.previous);
      }
    },
    onSuccess: (data) => {
      applyPreferencesLocally(data);
      queryClient.setQueryData(preferencesKeys.detail(), data);
    },
  });
}
