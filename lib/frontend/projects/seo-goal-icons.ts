import type { TAppIconComponent } from "@/components/ui/app-icon";
import { Icons } from "@/lib/frontend/icons/app-icons";
import type { TSeoGoal } from "@/lib/projects/constants";

export const SEO_GOAL_ICONS: Record<TSeoGoal, TAppIconComponent> = {
  grow_brand_awareness: Icons.megaphone,
  outrank_competitors: Icons.chartBar,
  get_more_calls: Icons.call,
  increase_online_orders: Icons.cart,
  improve_local_visibility: Icons.store,
};
