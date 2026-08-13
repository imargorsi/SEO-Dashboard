import type { TAppIconComponent } from "@/components/ui/app-icon";
import { Icons } from "@/lib/frontend/icons/app-icons";

/** Icons for permission-catalog module slugs in the roles matrix / detail UI. */
const MODULE_ICONS: Record<string, TAppIconComponent> = {
  dashboard: Icons.dashboard,
  projects: Icons.briefcase,
  analytics: Icons.analytics,
  seo_activities: Icons.rocket,
  leads: Icons.userGroup,
  integrations: Icons.link,
  members: Icons.userGroup,
  users: Icons.userSharing,
  roles: Icons.access,
};

export function permissionModuleIcon(slug: string): TAppIconComponent {
  return MODULE_ICONS[slug] ?? Icons.package;
}
