import { NextResponse } from "next/server";

import { ApiResponse } from "@/lib/api/response";
import { NotFoundError, ValidationError } from "@/lib/api/http-errors";
import type { AuthContext } from "@/lib/auth/guards";
import { getProjectForUser } from "@/lib/projects/get-project";
import { mapUpdateProjectFields } from "@/lib/projects/project-field-map.utils";
import { deleteStoredProjectLogo } from "@/lib/projects/project-logo-storage";
import { serializeProject } from "@/lib/serializers/project";
import { resolveOwnerMap } from "@/lib/projects/resolve-project-owner.utils";
import { resolveProjectInvitees } from "@/lib/projects/resolve-project-invitees";
import type { ProjectDocument } from "@/models";
import type { UpdateProjectInput } from "@/schemas/project";

type UpdateProjectOptions = {
  logoImage?: string | null;
};

export async function updateProject(
  auth: AuthContext,
  projectId: string,
  input: UpdateProjectInput,
  presentFields: ReadonlySet<string>,
  options?: UpdateProjectOptions,
): Promise<{ project: ProjectDocument }> {
  const project = await getProjectForUser(auth, projectId);
  if (!project) {
    throw new NotFoundError("Project");
  }

  if (project.status === "rejected") {
    throw new ValidationError(
      { status: ["Rejected Projects Cannot Be Edited."] },
      "Rejected Projects Cannot Be Edited.",
    );
  }

  const patch = mapUpdateProjectFields(input, presentFields);
  const previousLogo = project.logoImage;

  if (options?.logoImage) {
    patch.logoImage = options.logoImage;
  }

  if (Object.keys(patch).length === 0) {
    throw ValidationError.fromFieldErrors({
      _: ["At Least One Field Must Be Provided."],
    });
  }

  project.set(patch);
  await project.save();

  if (options?.logoImage && previousLogo && previousLogo !== options.logoImage) {
    await deleteStoredProjectLogo(previousLogo);
  }

  return { project };
}

export async function buildUpdateProjectResponse(project: ProjectDocument): Promise<NextResponse> {
  const [ownerMap, invitedUsers] = await Promise.all([
    resolveOwnerMap([project]),
    resolveProjectInvitees(project._id.toString()),
  ]);
  return ApiResponse.success(
    serializeProject(project, ownerMap.get(project._id.toString()), invitedUsers),
    "Project Updated Successfully.",
  );
}
