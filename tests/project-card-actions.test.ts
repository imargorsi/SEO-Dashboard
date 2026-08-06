import { describe, expect, it } from "vitest";

import { buildProjectCardActions } from "@/lib/projects/project-card-actions.utils";

describe("buildProjectCardActions", () => {
  it("allows viewDetails on rejected projects but omits edit and invite", () => {
    const actions = buildProjectCardActions({
      status: "rejected",
      projectId: "abc123",
      isSuperAdmin: true,
      canViewDetails: true,
      canEditProject: true,
      canInviteMembers: true,
      canDeleteProject: true,
    });

    expect(actions.map((action) => action.id)).toEqual(["viewDetails", "delete"]);
    expect(actions.some((action) => action.id === "edit")).toBe(false);
    expect(actions.some((action) => action.id === "inviteUsers")).toBe(false);
  });

  it("includes viewDetails for active projects when allowed", () => {
    const actions = buildProjectCardActions({
      status: "active",
      projectId: "abc123",
      isSuperAdmin: false,
      canViewDetails: true,
      canEditProject: false,
      canInviteMembers: false,
      canDeleteProject: false,
    });

    expect(actions.some((action) => action.id === "viewDetails")).toBe(true);
  });
});
