import type { TProjectListOwnerRef, TProjectOwnerRef } from "@/types/project.types";

export function resolveProjectOwnerId(project: TProjectOwnerRef | TProjectListOwnerRef): string {
  return project.owner?.id ?? project.createdByUserId;
}
