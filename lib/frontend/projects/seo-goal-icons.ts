import type { IconType } from "react-icons";
import {
  IoBarChartOutline,
  IoCallOutline,
  IoCartOutline,
  IoMegaphoneOutline,
  IoStorefrontOutline,
} from "react-icons/io5";

import type { TSeoGoal } from "@/lib/projects/constants";

export const SEO_GOAL_ICONS: Record<TSeoGoal, IconType> = {
  grow_brand_awareness: IoMegaphoneOutline,
  outrank_competitors: IoBarChartOutline,
  get_more_calls: IoCallOutline,
  increase_online_orders: IoCartOutline,
  improve_local_visibility: IoStorefrontOutline,
};
