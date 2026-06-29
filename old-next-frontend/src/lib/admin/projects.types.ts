export const PROJECTS_ENDPOINT = "/v1/projects" as const

export type ProjectSeoGoal = {
  id: number
  slug: string
  name: string
}

export type ProjectItem = {
  id: number
  company_id: number
  business_name: string
  website_url: string
  industry_niche_id: number
  industry_other: string | null
  target_locations: string[]
  is_b2b: boolean | null
  is_b2c: boolean | null
  brief_description: string | null
  main_competitors: string | null
  seo_goal_other: string | null
  has_google_analytics: boolean | null
  has_google_search_console: boolean | null
  has_google_tag_manager: boolean | null
  has_google_ads: boolean | null
  has_website_login_details: boolean | null
  cms_login_page_url: string | null
  cms_username: string | null
  cms_password_set: boolean | null
  seo_goals: ProjectSeoGoal[]
  seo_goal_ids: number[]
  created_at: string
  updated_at: string
}

export type ProjectsPagination = {
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

export type ProjectsResponse = {
  success: boolean
  message: string | null
  data: {
    items: ProjectItem[]
    pagination: ProjectsPagination
    filters: {
      search: string | null
      sort: string
      direction: string
      page: number
      per_page: number
    }
  }
}

/** `DELETE /v1/projects/:id` */
export type ProjectDeleteResponse = {
  success: boolean
  message: string | null
  data: null
}

export function projectPath(id: number) {
  return `${PROJECTS_ENDPOINT}/${id}` as const
}
