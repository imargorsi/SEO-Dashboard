import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { ApiResponse } from "@/lib/api/response";
import { ValidationError } from "@/lib/api/http-errors";
import type { AuthContext } from "@/lib/auth/guards";
import { assignProjectMember } from "@/lib/projects/assign-member";
import { serializeProject } from "@/lib/serializers/project";
import { PROJECT_OWNER_ROLE, SUPER_ADMIN_ROLE } from "@/lib/rbac/roles";
import { seedSystemRoles } from "@/lib/rbac/seed-roles";
import { Project, User, type ProjectDocument } from "@/models";
import type { CreateProjectInput } from "@/schemas/project";

function emptyToNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function mapOnboardingFields(input: CreateProjectInput) {
  return {
    businessName: input.businessName.trim(),
    websiteUrl: input.websiteUrl.trim(),
    businessAddress: emptyToNull(input.businessAddress),
    pocContactNumber: emptyToNull(input.pocContactNumber),
    servicesOffered: input.servicesOffered ?? [],
    primaryServiceToPromote: emptyToNull(input.primaryServiceToPromote),
    idealCustomerProfile: emptyToNull(input.idealCustomerProfile),
    targetLocations: input.targetLocations ?? [],
    businessHours: input.businessHours
      ? {
          opensAt: emptyToNull(input.businessHours.opensAt),
          closesAt: emptyToNull(input.businessHours.closesAt),
        }
      : null,
    seoGoals: input.seoGoals ?? [],
    marketingAccess: {
      websiteLogin: emptyToNull(input.marketingAccess?.websiteLogin),
      websiteHosting: emptyToNull(input.marketingAccess?.websiteHosting),
      googleAnalytics: emptyToNull(input.marketingAccess?.googleAnalytics),
      googleSearchConsole: emptyToNull(input.marketingAccess?.googleSearchConsole),
      googleBusinessProfile: emptyToNull(input.marketingAccess?.googleBusinessProfile),
    },
    competitorUrls: input.competitorUrls ?? [],
  };
}

type CreateActors = {
  ownerUserId: mongoose.Types.ObjectId;
  pocEmail: string;
};

async function resolveCreateActors(auth: AuthContext, input: CreateProjectInput): Promise<CreateActors> {
  const isAdmin = auth.user.roles.includes(SUPER_ADMIN_ROLE);

  if (!isAdmin) {
    if (input.ownerUserId) {
      throw ValidationError.fromFieldErrors({
        ownerUserId: ["Only platform admins can assign a project owner."],
      });
    }

    return {
      ownerUserId: auth.user._id,
      pocEmail: auth.user.email.toLowerCase(),
    };
  }

  if (!input.ownerUserId) {
    throw ValidationError.fromFieldErrors({
      ownerUserId: ["Owner is required when creating a project as admin."],
    });
  }

  if (!mongoose.Types.ObjectId.isValid(input.ownerUserId)) {
    throw ValidationError.fromFieldErrors({
      ownerUserId: ["The selected owner is invalid."],
    });
  }

  const owner = await User.findById(input.ownerUserId);
  if (!owner) {
    throw ValidationError.fromFieldErrors({
      ownerUserId: ["The selected owner does not exist."],
    });
  }

  if (!owner.hasVerifiedEmail()) {
    throw ValidationError.fromFieldErrors({
      ownerUserId: ["The selected owner must have a verified email."],
    });
  }

  return {
    ownerUserId: owner._id,
    pocEmail: owner.email.toLowerCase(),
  };
}

export async function createProject(
  auth: AuthContext,
  input: CreateProjectInput,
  options?: { logoImage?: string | null },
): Promise<{ project: ProjectDocument }> {
  await seedSystemRoles();

  const isAdmin = auth.user.roles.includes(SUPER_ADMIN_ROLE);
  const { ownerUserId, pocEmail } = await resolveCreateActors(auth, input);
  const onboarding = mapOnboardingFields(input);

  const project = await Project.create({
    ...onboarding,
    logoImage: options?.logoImage ?? null,
    pocEmail,
    status: isAdmin ? "active" : "pending",
    createdByUserId: auth.user._id,
    approvedAt: isAdmin ? new Date() : null,
    approvedByUserId: isAdmin ? auth.user._id : null,
  });

  await assignProjectMember({
    projectId: project._id,
    userId: ownerUserId,
    roleSlug: PROJECT_OWNER_ROLE,
  });

  return { project };
}

export function buildCreateProjectResponse(project: ProjectDocument): NextResponse {
  return ApiResponse.success(serializeProject(project), "Project created successfully.", 201);
}
