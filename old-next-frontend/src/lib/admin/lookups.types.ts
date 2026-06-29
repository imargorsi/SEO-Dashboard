export const INDUSTRY_NICHES_ENDPOINT = "/v1/lookups/industry-niches" as const
export const SEO_GOALS_ENDPOINT = "/v1/lookups/seo-goals" as const

export type LookupItem = {
  id: number
  slug: string
  name: string
}

export type IndustryNichesResponse = {
  success: boolean
  message: string | null
  data: LookupItem[]
}

export type SeoGoalsResponse = {
  success: boolean
  message: string | null
  data: LookupItem[]
}
