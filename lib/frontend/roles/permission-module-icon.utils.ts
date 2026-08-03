import type { IconType } from "react-icons";
import {
  IoAnalyticsOutline,
  IoBriefcaseOutline,
  IoCubeOutline,
  IoLinkOutline,
  IoPeopleOutline,
  IoPersonCircleOutline,
  IoRocketOutline,
  IoShieldCheckmarkOutline,
  IoSpeedometerOutline,
} from "react-icons/io5";

/** Icons for permission-catalog module slugs in the roles matrix / detail UI. */
const MODULE_ICONS: Record<string, IconType> = {
  dashboard: IoSpeedometerOutline,
  projects: IoBriefcaseOutline,
  analytics: IoAnalyticsOutline,
  seo_activities: IoRocketOutline,
  leads: IoPeopleOutline,
  integrations: IoLinkOutline,
  members: IoPeopleOutline,
  users: IoPersonCircleOutline,
  roles: IoShieldCheckmarkOutline,
};

export function permissionModuleIcon(slug: string): IconType {
  return MODULE_ICONS[slug] ?? IoCubeOutline;
}
