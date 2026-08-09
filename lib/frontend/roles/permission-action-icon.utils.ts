"use client";

import type { IconType } from "react-icons";
import {
  IoAddOutline,
  IoCloudDownloadOutline,
  IoCloudUploadOutline,
  IoEyeOutline,
  IoPersonAddOutline,
  IoPersonRemoveOutline,
  IoRefreshOutline,
  IoTrashOutline,
  IoUnlinkOutline,
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
    case "disconnect":
      return IoUnlinkOutline;
    case "refresh":
      return IoRefreshOutline;
    case "import":
      return IoCloudUploadOutline;
    case "export":
      return IoCloudDownloadOutline;
    default:
      return null;
  }
}

/** @deprecated Prefer `roleActionIcon` — same mapping for permission catalog actions. */
export const actionIcon = roleActionIcon;
