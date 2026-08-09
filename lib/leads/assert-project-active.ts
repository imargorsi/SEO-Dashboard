import { Project } from "@/models";
import { ValidationError } from "@/lib/api/http-errors";

export async function assertProjectActiveForLeads(projectId: string): Promise<void> {
  const project = await Project.findById(projectId).select("status");
  if (!project) {
    throw new ValidationError({ projectId: ["Project not found."] }, "Project not found.");
  }
  if (project.status !== "active") {
    throw new ValidationError(
      { projectId: ["Leads can only be added when the project is active."] },
      "Project must be active to add leads.",
    );
  }
}
