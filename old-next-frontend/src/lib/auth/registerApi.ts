import { api } from "@/lib/api"

export const REGISTER_COMPANY_ENDPOINT = "/v1/auth/register-company" as const

export type RegisterApiPayload = {
  company_name: string
  poc_name: string
  poc_email: string
  password: string
  password_confirmation: string
}

export type RegisterApiResponse = {
  success: boolean
  message: string | null
  data?: unknown
  errors?: Record<string, string[]>
}

export function submitRegistration(payload: RegisterApiPayload) {
  return api.post<RegisterApiResponse>(REGISTER_COMPANY_ENDPOINT, payload)
}
