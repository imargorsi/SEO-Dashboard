import type { TLeadOrigin } from "@/types/lead.types";

export type TLeadSourceGroup = "wordpress" | "internal";

/** Table/export grouping: plugin ingest vs CSV/manual. */
export function leadSourceGroup(origin: TLeadOrigin): TLeadSourceGroup {
  return origin === "wordpress" ? "wordpress" : "internal";
}
