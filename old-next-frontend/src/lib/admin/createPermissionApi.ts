import type { PermissionTableRow } from "@/components/table/PermissionsTable"
import {
  ADMIN_PERMISSIONS_ENDPOINT,
  type AdminPermissionItem,
  adminPermissionPath,
} from "@/lib/admin/permissions.types"
import { api } from "@/lib/api"

export type CreatePermissionApiPayload = {
  name: string
}

export type CreatePermissionApiResponse = {
  success: boolean
  message: string | null
  data?: AdminPermissionItem | null
  errors?: Record<string, unknown>
}

export type PermissionsListLocationState = {
  feedback?: {
    variant: "default" | "destructive"
    title: string
    description: string
  }
}

export type PermissionsEditLocationState = {
  permission: PermissionTableRow
}

export type CreatePermissionFormValues = {
  name: string
}

export function permissionRowToFormValues(
  row: PermissionTableRow,
): CreatePermissionFormValues {
  return {
    name: row.name,
  }
}

export function postPermission(payload: CreatePermissionApiPayload) {
  return api.post<CreatePermissionApiResponse>(
    ADMIN_PERMISSIONS_ENDPOINT,
    payload,
  )
}

export function putPermission(id: number, payload: CreatePermissionApiPayload) {
  return api.put<CreatePermissionApiResponse>(
    adminPermissionPath(id),
    payload,
  )
}
