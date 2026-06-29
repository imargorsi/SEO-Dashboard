import { api } from "@/lib/api"

export const FORGOT_PASSWORD_ENDPOINT = "/v1/auth/forgot-password" as const

export type ForgotPasswordApiPayload = {
  email: string
}

export type ForgotPasswordApiResponse = {
  success: boolean
  message: string | null
  data?: null
  errors?: Record<string, unknown>
}

export function requestPasswordReset(email: string) {
  return api.post<ForgotPasswordApiResponse>(FORGOT_PASSWORD_ENDPOINT, {
    email,
  } satisfies ForgotPasswordApiPayload)
}
