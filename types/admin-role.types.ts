import type { TListPagination, TPaginatedList } from "@/types/admin-user.types";

export type TAdminRoleListItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  scope: "platform" | "project";
  is_system: boolean;
  permissions_count: number;
  members_count: number;
  created_at: string;
  updated_at: string;
};

export type TAdminRoleDetail = TAdminRoleListItem & {
  permissions: string[];
};

export type TRoleListFilters = {
  search: string | null;
  newest: boolean;
};

export type TPaginatedRoleList = TPaginatedList<TAdminRoleListItem>;
