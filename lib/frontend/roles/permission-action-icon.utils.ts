"use client";

import type { IconType } from "react-icons";
import {
  IoAddOutline,
  IoEyeOutline,
  IoPersonAddOutline,
  IoPersonRemoveOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { PiPencilThin } from "react-icons/pi";

/**
 * Unified icons for role / permission actions.
 * Use everywhere in roles UI (table, detail, matrix, dialogs).
 */
export function roleActionIcon(action: string): IconType | null {
  switch (action) {
    case "view":
      return IoEyeOutline;
    case "create":
      return IoAddOutline;
    case "edit":
    case "update":
      return PiPencilThin;
    case "delete":
      return IoTrashOutline;
    case "invite":
      return IoPersonAddOutline;
    case "remove":
      return IoPersonRemoveOutline;
    default:
      return null;
  }
}

/** @deprecated Prefer `roleActionIcon` — same mapping for permission catalog actions. */
export const actionIcon = roleActionIcon;
