import {
  adminCompanyApprovePath,
  type AdminCompanyApproveResponse,
} from "@/lib/admin/companies.types"
import { api } from "@/lib/api"

export function postApproveCompany(id: number) {
  return api.post<AdminCompanyApproveResponse>(adminCompanyApprovePath(id))
}
