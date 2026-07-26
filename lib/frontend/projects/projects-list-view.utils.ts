/** Projects list layout mode — synced via `?view=` (default omitted = cards). */

export const PROJECT_LIST_VIEW_MODES = ["cards", "table"] as const;

export type TProjectListViewMode = (typeof PROJECT_LIST_VIEW_MODES)[number];

export const DEFAULT_PROJECT_LIST_VIEW_MODE: TProjectListViewMode = "cards";

export function parseProjectListViewMode(value: unknown): TProjectListViewMode {
  if (typeof value !== "string") return DEFAULT_PROJECT_LIST_VIEW_MODE;
  if (value === "table") return "table";
  return DEFAULT_PROJECT_LIST_VIEW_MODE;
}
