export const ADMIN_COMPANIES_ENDPOINT = "/v1/admin/companies" as const

/** Registration approval from register-company flow (`pending` | `approved`). */
export type CompanyRegistrationStatus = "pending" | "approved"

export type AdminCompanyItem = {
  id: number
  name: string
  slug: string
  poc_name: string | null
  poc_email: string | null
  users_count: number
  created_at: string
  updated_at: string
  is_active?: boolean
  status?: CompanyRegistrationStatus | string
}

export type AdminCompaniesPagination = {
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

export type AdminCompaniesResponse = {
  success: boolean
  message: string | null
  data: {
    items: AdminCompanyItem[]
    pagination: AdminCompaniesPagination
    filters: {
      search: string | null
      sort: string
      direction: string
      page: number
      per_page: number
    }
  }
}

/** `DELETE /v1/admin/companies/:id` */
export type AdminCompanyDeleteResponse = {
  success: boolean
  message: string | null
  data: null
}

export function adminCompanyPath(id: number) {
  return `${ADMIN_COMPANIES_ENDPOINT}/${id}` as const
}

export function adminCompanyApprovePath(id: number) {
  return `${ADMIN_COMPANIES_ENDPOINT}/${id}/approve` as const
}

export type AdminCompanyApproveResponse = {
  success: boolean
  message: string | null
  data?: AdminCompanyItem | null
}
