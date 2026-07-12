import type { Types } from "mongoose";

import type { AuthContext } from "@/lib/auth/guards";
import type { UserDocument } from "@/models";
import type { CreateProjectInput } from "@/schemas/project";

export function authContextFor(user: UserDocument): AuthContext {
  return {
    user,
    token: "test-token",
    tokenId: user._id as Types.ObjectId,
  };
}

export function projectInput(
  overrides: Pick<CreateProjectInput, "businessName" | "websiteUrl"> &
    Partial<CreateProjectInput>,
): CreateProjectInput {
  return {
    servicesOffered: [],
    targetLocations: [],
    competitorUrls: [],
    seoGoals: [],
    ...overrides,
  };
}
