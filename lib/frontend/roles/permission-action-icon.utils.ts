import type { TAppIconComponent } from "@/components/ui/app-icon";
import { Icons } from "@/lib/frontend/icons/app-icons";

/**
 * Unified icons for role / permission actions.
 * Use everywhere in roles UI (table, detail, matrix, dialogs).
 */
export function roleActionIcon(action: string): TAppIconComponent | null {
  switch (action) {
    case "view":
      return Icons.view;
    case "create":
      return Icons.add;
    case "edit":
    case "update":
      return Icons.pencil;
    case "delete":
      return Icons.delete;
    case "invite":
      return Icons.userAdd;
    case "remove":
      return Icons.userMinus;
    case "disconnect":
      return Icons.unlink;
    case "refresh":
      return Icons.refresh;
    case "import":
      return Icons.cloudUpload;
    case "export":
      return Icons.cloudDownload;
    default:
      return null;
  }
}

/** @deprecated Prefer `roleActionIcon` — same mapping for permission catalog actions. */
export const actionIcon = roleActionIcon;
