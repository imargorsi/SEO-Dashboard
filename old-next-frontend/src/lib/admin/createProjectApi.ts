import type {
  CreateProjectApiPayload,
} from "@/components/forms/createProjectForm.types"
import {
  PROJECTS_ENDPOINT,
  projectPath,
  type ProjectItem,
} from "@/lib/admin/projects.types"
import { api } from "@/lib/api"

export type CreateProjectApiResponse = {
  success: boolean
  message: string | null
  data?: ProjectItem | null
}

export function postProject(payload: CreateProjectApiPayload) {
  return api.post<CreateProjectApiResponse>(PROJECTS_ENDPOINT, payload)
}

export function putProject(id: number, payload: CreateProjectApiPayload) {
  return api.put<CreateProjectApiResponse>(projectPath(id), payload)
}
