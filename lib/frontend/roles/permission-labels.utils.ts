type TActionLabelKey = "view" | "create" | "edit" | "delete" | "invite" | "remove";

/** Maps a catalog action to its locale key under `modules.roles.actions` (undefined for an unrecognized action). */
const ACTION_LABEL_KEYS: Record<string, TActionLabelKey> = {
  view: "view",
  create: "create",
  update: "edit",
  delete: "delete",
  invite: "invite",
  remove: "remove",
};

export function actionLabelKey(action: string): TActionLabelKey | undefined {
  return ACTION_LABEL_KEYS[action];
}

/** Defensive fallback for an action with no locale entry — should not normally occur. */
export function capitalizeAction(action: string): string {
  return action.charAt(0).toUpperCase() + action.slice(1);
}

export function modulePermission(moduleSlug: string, action: string): string {
  return `${moduleSlug}.${action}`;
}
