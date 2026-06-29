import { api } from "@/lib/api"

export const RESET_PASSWORD_ENDPOINT = "/v1/auth/reset-password" as const

export type ResetPasswordApiPayload = {
  token: string
  email: string
  password: string
  password_confirmation: string
}

export type ResetPasswordApiResponse = {
  success: boolean
  message: string | null
  data?: null
  errors?: Record<string, string[]>
}

export function submitPasswordReset(payload: ResetPasswordApiPayload) {
  return api.post<ResetPasswordApiResponse>(RESET_PASSWORD_ENDPOINT, payload)
}
