import { api } from "@/lib/api"

export const CHANGE_PASSWORD_ENDPOINT = "/v1/me/password" as const

export type ChangePasswordApiPayload = {
  current_password: string
  password: string
  password_confirmation: string
}

export type ChangePasswordApiResponse = {
  success: boolean
  message: string | null
  data?: null
  errors?: Partial<Record<keyof ChangePasswordApiPayload, string[]>>
}

export function changePassword(payload: ChangePasswordApiPayload) {
  return api.put<ChangePasswordApiResponse>(CHANGE_PASSWORD_ENDPOINT, payload)
}
