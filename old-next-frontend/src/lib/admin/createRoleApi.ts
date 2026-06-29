import type { RoleTableRow } from "@/components/table/RolesTable"
import {
  ADMIN_ROLES_ENDPOINT,
  type AdminRoleItem,
  adminRolePath,
} from "@/lib/admin/roles.types"
import { api } from "@/lib/api"

export type CreateRoleApiPayload = {
  name: string
  permissions: string[]
}

export type CreateRoleApiResponse = {
  success: boolean
  message: string | null
  data?: AdminRoleItem | null
  errors?: Record<string, unknown>
}

export type RolesListLocationState = {
  feedback?: {
    variant: "default" | "destructive"
    title: string
    description: string
  }
}

export type RolesEditLocationState = {
  role: RoleTableRow
}

export type CreateRoleFormValues = {
  name: string
  permissions: string[]
}

export function roleRowToFormValues(row: RoleTableRow): CreateRoleFormValues {
  return {
    name: row.name,
    permissions: row.permissions.slice(),
  }
}

export function postRole(payload: CreateRoleApiPayload) {
  return api.post<CreateRoleApiResponse>(ADMIN_ROLES_ENDPOINT, payload)
}

export function putRole(id: number, payload: CreateRoleApiPayload) {
  return api.put<CreateRoleApiResponse>(adminRolePath(id), payload)
}
