export const ADMIN_PERMISSIONS_ENDPOINT = "/v1/admin/permissions" as const

export type AdminPermissionItem = {
  id: number
  name: string
  /** Present from API; not shown in the permissions list UI */
  guard_name?: string
  roles_count: number
  created_at: string
  updated_at: string
}

export type AdminPermissionsPagination = {
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

export type AdminPermissionsResponse = {
  success: boolean
  message: string | null
  data: {
    items: AdminPermissionItem[]
    pagination: AdminPermissionsPagination
    filters: {
      search: string | null
      sort: string
      direction: string
      page: number
      per_page: number
    }
  }
}

/** `DELETE /v1/admin/permissions/:id` */
export type AdminPermissionDeleteResponse = {
  success: boolean
  message: string | null
  data?: null
  errors?: Record<string, unknown>
}

export function adminPermissionPath(id: number) {
  return `${ADMIN_PERMISSIONS_ENDPOINT}/${id}` as const
}
