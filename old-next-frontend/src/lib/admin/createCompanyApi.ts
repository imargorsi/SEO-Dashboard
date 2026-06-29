import { ADMIN_COMPANIES_ENDPOINT, adminCompanyPath } from "@/lib/admin/companies.types"
import type {
  CreateCompanyApiPayload,
  CreateCompanyApiResponse,
} from "@/lib/admin/createCompany.types"
import { api } from "@/lib/api"

export function postCompany(payload: CreateCompanyApiPayload) {
  return api.post<CreateCompanyApiResponse>(ADMIN_COMPANIES_ENDPOINT, payload)
}

export function putCompany(id: number, payload: CreateCompanyApiPayload) {
  return api.put<CreateCompanyApiResponse>(adminCompanyPath(id), payload)
}
