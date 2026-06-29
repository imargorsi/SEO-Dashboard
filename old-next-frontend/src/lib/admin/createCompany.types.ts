export type CreateCompanyApiPayload = {
  company_name: string
  poc_name: string
  poc_email: string
  is_active: boolean
}

export type CreateCompanyApiResponse = {
  success: boolean
  message: string | null
  data: unknown
}
