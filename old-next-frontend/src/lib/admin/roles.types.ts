export const ADMIN_ROLES_ENDPOINT = "/v1/admin/roles" as const

export type AdminRoleItem = {
  id: number
  name: string
  /** Present from API; not shown in the roles list UI */
  guard_name?: string
  permissions: string[]
  users_count?: number
  permissions_count: number
  created_at: string
  updated_at: string
}

export type AdminRolesPagination = {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
  has_more_pages: boolean
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
}

export type AdminRolesResponse = {
  success: boolean
  message: string | null
  data: {
    items: AdminRoleItem[]
    pagination: AdminRolesPagination
    filters: {
      search: string | null
      sort: string
      direction: string
      page: number
      per_page: number
    }
  }
}

/** `DELETE /v1/admin/roles/:id` */
export type AdminRoleDeleteResponse = {
  success: boolean
  message: string | null
  data?: null
  errors?: Record<string, unknown>
}

export function adminRolePath(id: number) {
  return `${ADMIN_ROLES_ENDPOINT}/${id}` as const
}
