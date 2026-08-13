import { describe, expect, it } from "vitest";

import { runAssistantQuery } from "@/lib/assistant/run-query";
import { listAssistantHistory } from "@/lib/assistant/history";
import { hashPassword } from "@/lib/auth/password";
import { utcYesterdayString } from "@/lib/integrations/date.utils";
import { createLead } from "@/lib/leads/create-lead";
import { todayLeadDate } from "@/lib/leads/normalize";
import { createProject } from "@/lib/projects/create-project";
import { seedSystemRoles } from "@/lib/rbac/seed-roles";
import { createSeoActivity } from "@/lib/seo-activities/create-seo-activity";
import {
  AnalyticsDailyMetric,
  AssistantQueryHistory,
  Project,
  ProjectMember,
  Role,
  User,
} from "@/models";
import { authContextFor, projectInput } from "@/tests/helpers/project-test-utils";

describe("Dashboard assistant query", () => {
  it("answers lead intents for members with leads.view and stores history", async () => {
    await seedSystemRoles();

    const owner = await User.create({
      name: "Dash Owner",
      email: "dash-owner@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(owner),
      projectInput({
        businessName: "Dash Project",
        websiteUrl: "https://dash.example.com",
      }),
    );
    await Project.findByIdAndUpdate(project._id, { status: "active" });
    const projectId = project._id.toString();
    const auth = authContextFor(owner);

    await createLead(auth, projectId, {
      firstName: "Ada",
      lastName: "",
      email: "ada@example.com",
      phone: "+1 (555) 010-3000",
      servicesInterestedIn: null,
      message: "Hello",
      leadDate: todayLeadDate(),
    });

    const result = await runAssistantQuery(auth, projectId, {
      query: "How many leads this month?",
    });

    expect(result.intent).toBe("leads_count");
    expect(result.message.toLowerCase()).toContain("lead");
    expect(result.action?.label).toBe("View Leads");
    expect(result.action?.route).toMatch(/^\/leads\?from=/);
    expect(result.history).toHaveLength(1);
    expect(result.history[0]?.query).toBe("How many leads this month?");
  });

  it("denies lead intents without leads.view and still records history", async () => {
    await seedSystemRoles();

    const owner = await User.create({
      name: "Owner",
      email: "dash-owner-2@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const viewer = await User.create({
      name: "Viewer",
      email: "dash-viewer@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(owner),
      projectInput({
        businessName: "Dash Deny Project",
        websiteUrl: "https://dash-deny.example.com",
      }),
    );
    await Project.findByIdAndUpdate(project._id, { status: "active" });

    const dashOnlyRole = await Role.create({
      name: "Dashboard Only",
      slug: "dashboard_only_test",
      scope: "project",
      status: "active",
      permissions: ["dashboard.view"],
      isSystem: false,
    });

    await ProjectMember.create({
      projectId: project._id,
      userId: viewer._id,
      roleId: dashOnlyRole._id,
      status: "active",
    });

    const projectId = project._id.toString();
    const result = await runAssistantQuery(authContextFor(viewer), projectId, {
      query: "leads this month",
    });

    expect(result.intent).toBe("leads_count");
    expect(result.message.toLowerCase()).toContain("permission");
    expect(result.action).toBeUndefined();
    expect(result.history).toHaveLength(1);
  });

  it("keeps history private per user and caps at five", async () => {
    await seedSystemRoles();

    const owner = await User.create({
      name: "History Owner",
      email: "dash-history@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const other = await User.create({
      name: "Other Member",
      email: "dash-other@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(owner),
      projectInput({
        businessName: "History Project",
        websiteUrl: "https://dash-history.example.com",
      }),
    );
    await Project.findByIdAndUpdate(project._id, { status: "active" });

    const projectUserRole = await Role.findOne({ slug: "project_user" });
    expect(projectUserRole).not.toBeNull();

    await ProjectMember.create({
      projectId: project._id,
      userId: other._id,
      roleId: projectUserRole!._id,
      status: "active",
    });

    const projectId = project._id.toString();
    const ownerAuth = authContextFor(owner);

    for (let i = 1; i <= 6; i += 1) {
      await runAssistantQuery(ownerAuth, projectId, {
        query: `leads this month run ${i}`,
      });
    }

    const ownerHistory = await listAssistantHistory(projectId, owner._id.toString());
    expect(ownerHistory).toHaveLength(5);
    expect(ownerHistory[0]?.query).toBe("leads this month run 6");

    const otherHistory = await listAssistantHistory(projectId, other._id.toString());
    expect(otherHistory).toHaveLength(0);

    const stored = await AssistantQueryHistory.countDocuments({
      projectId,
      userId: owner._id,
    });
    expect(stored).toBe(5);
  });

  it("returns unknown safely for unsupported questions", async () => {
    await seedSystemRoles();

    const owner = await User.create({
      name: "Unknown Owner",
      email: "dash-unknown@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(owner),
      projectInput({
        businessName: "Unknown Project",
        websiteUrl: "https://dash-unknown.example.com",
      }),
    );
    await Project.findByIdAndUpdate(project._id, { status: "active" });

    const result = await runAssistantQuery(authContextFor(owner), project._id.toString(), {
      query: "schedule a meeting",
    });

    expect(result.intent).toBe("unknown");
    expect(result.action).toBeUndefined();
    expect(result.message.toLowerCase()).toContain("understand");
  });

  it("answers SEO activity counts for members with seo_activities.view", async () => {
    await seedSystemRoles();

    const owner = await User.create({
      name: "Seo Owner",
      email: "dash-seo@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(owner),
      projectInput({
        businessName: "Seo Assist Project",
        websiteUrl: "https://dash-seo.example.com",
      }),
    );
    await Project.findByIdAndUpdate(project._id, { status: "active" });
    const projectId = project._id.toString();
    const auth = authContextFor(owner);

    await createSeoActivity(auth, projectId, {
      type: "blogs",
      title: "Local Guide",
      url: "https://dash-seo.example.com/blog/local",
      occurredOn: todayLeadDate(),
    });

    const result = await runAssistantQuery(auth, projectId, {
      query: "How many blogs?",
    });

    expect(result.intent).toBe("seo_count");
    expect(result.message.toLowerCase()).toContain("blog");
    expect(result.action?.label).toBe("View SEO Activities");
    expect(result.action?.route).toMatch(/^\/seo-activities/);
  });

  it("denies SEO intents without seo_activities.view and still records history", async () => {
    await seedSystemRoles();

    const owner = await User.create({
      name: "Owner",
      email: "dash-seo-owner@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const viewer = await User.create({
      name: "Viewer",
      email: "dash-seo-viewer@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(owner),
      projectInput({
        businessName: "Seo Deny Project",
        websiteUrl: "https://dash-seo-deny.example.com",
      }),
    );
    await Project.findByIdAndUpdate(project._id, { status: "active" });

    const dashOnlyRole = await Role.create({
      name: "Dashboard Only Seo",
      slug: "dashboard_only_seo_test",
      scope: "project",
      status: "active",
      permissions: ["dashboard.view"],
      isSystem: false,
    });

    await ProjectMember.create({
      projectId: project._id,
      userId: viewer._id,
      roleId: dashOnlyRole._id,
      status: "active",
    });

    const result = await runAssistantQuery(authContextFor(viewer), project._id.toString(), {
      query: "How many blogs?",
    });

    expect(result.intent).toBe("seo_count");
    expect(result.message.toLowerCase()).toContain("permission");
    expect(result.action).toBeUndefined();
    expect(result.history).toHaveLength(1);
  });

  it("answers analytics metric intents from cached overview data", async () => {
    await seedSystemRoles();

    const owner = await User.create({
      name: "Analytics Owner",
      email: "dash-analytics@example.com",
      password: await hashPassword("password"),
      emailVerifiedAt: new Date(),
      roles: [],
    });

    const { project } = await createProject(
      authContextFor(owner),
      projectInput({
        businessName: "Analytics Assist Project",
        websiteUrl: "https://dash-analytics.example.com",
      }),
    );
    await Project.findByIdAndUpdate(project._id, { status: "active" });
    const projectId = project._id.toString();

    await AnalyticsDailyMetric.create({
      projectId,
      date: utcYesterdayString(),
      source: "gsc",
      clicks: 42,
      impressions: 400,
      ctr: 0.105,
      position: 8.2,
    });

    const result = await runAssistantQuery(authContextFor(owner), projectId, {
      query: "how many clicks last 30 days",
    });

    expect(result.intent).toBe("analytics_metric");
    expect(result.message).toContain("42");
    expect(result.action?.label).toBe("View Analytics");
    expect(result.action?.route).toMatch(/^\/analytics\?from=/);
  });
});
