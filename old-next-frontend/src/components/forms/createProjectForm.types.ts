import type { ProjectItem } from "@/lib/admin/projects.types"

export type CreateProjectFormValues = {
  business_name: string
  website_url: string
  /** Stored as a string in the form (select payload), coerced to number on submit. */
  industry_niche_id: string | null
  target_locations: string[]
  is_b2b: boolean
  is_b2c: boolean
  brief_description: string
  seo_goal_ids: number[]
  has_google_analytics: boolean
  has_google_search_console: boolean
  has_google_tag_manager: boolean
  has_google_ads: boolean
  has_website_login_details: boolean
  cms_login_page_url: string
  cms_username: string
  cms_password: string
}

export type CreateProjectApiPayload = {
  company_id: number
  business_name: string
  website_url: string
  industry_niche_id: number
  target_locations: string[]
  is_b2b: boolean
  is_b2c: boolean
  brief_description: string | null
  seo_goal_ids: number[]
  has_google_analytics: boolean
  has_google_search_console: boolean
  has_google_tag_manager: boolean
  has_google_ads: boolean
  has_website_login_details: boolean
  cms_login_page_url: string | null
  cms_username: string | null
  /** Omitted on edit if the field is left blank so the server keeps the existing password. */
  cms_password?: string | null
}

export function emptyCreateProjectValues(): CreateProjectFormValues {
  return {
    business_name: "",
    website_url: "",
    industry_niche_id: "",
    target_locations: [],
    is_b2b: false,
    is_b2c: false,
    brief_description: "",
    seo_goal_ids: [],
    has_google_analytics: false,
    has_google_search_console: false,
    has_google_tag_manager: false,
    has_google_ads: false,
    has_website_login_details: false,
    cms_login_page_url: "",
    cms_username: "",
    cms_password: "",
  }
}

export function toCreateProjectPayload(
  values: CreateProjectFormValues,
  companyId: number,
  options: { omitEmptyPassword?: boolean } = {},
): CreateProjectApiPayload {
  const trim = (s: string) => s.trim()
  const nullable = (s: string) => {
    const v = s.trim()
    return v ? v : null
  }
  const trimmedPassword = values.cms_password.trim()
  const payload: CreateProjectApiPayload = {
    company_id: companyId,
    business_name: trim(values.business_name),
    website_url: trim(values.website_url),
    industry_niche_id: Number(values.industry_niche_id),
    target_locations: values.target_locations
      .map(trim)
      .filter((s) => s.length > 0),
    is_b2b: Boolean(values.is_b2b),
    is_b2c: Boolean(values.is_b2c),
    brief_description: nullable(values.brief_description),
    seo_goal_ids: values.seo_goal_ids.slice(),
    has_google_analytics: Boolean(values.has_google_analytics),
    has_google_search_console: Boolean(values.has_google_search_console),
    has_google_tag_manager: Boolean(values.has_google_tag_manager),
    has_google_ads: Boolean(values.has_google_ads),
    has_website_login_details: Boolean(values.has_website_login_details),
    cms_login_page_url: nullable(values.cms_login_page_url),
    cms_username: nullable(values.cms_username),
  }
  if (!options.omitEmptyPassword || trimmedPassword) {
    payload.cms_password = trimmedPassword ? trimmedPassword : null
  }
  return payload
}

export type ProjectsEditLocationState = {
  project?: ProjectItem
  companyName?: string
}

/** Convert a row from the projects API into the form's value shape. */
export function projectRowToFormValues(
  p: ProjectItem,
): CreateProjectFormValues {
  return {
    business_name: p.business_name ?? "",
    website_url: p.website_url ?? "",
    industry_niche_id:
      p.industry_niche_id != null ? String(p.industry_niche_id) : "",
    target_locations: Array.isArray(p.target_locations)
      ? p.target_locations.slice()
      : [],
    is_b2b: p.is_b2b === true,
    is_b2c: p.is_b2c === true,
    brief_description: p.brief_description ?? "",
    seo_goal_ids: Array.isArray(p.seo_goal_ids) ? p.seo_goal_ids.slice() : [],
    has_google_analytics: p.has_google_analytics === true,
    has_google_search_console: p.has_google_search_console === true,
    has_google_tag_manager: p.has_google_tag_manager === true,
    has_google_ads: p.has_google_ads === true,
    has_website_login_details: p.has_website_login_details === true,
    cms_login_page_url: p.cms_login_page_url ?? "",
    cms_username: p.cms_username ?? "",
    cms_password: "",
  }
}
