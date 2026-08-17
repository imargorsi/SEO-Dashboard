import { describe, expect, it } from "vitest";

import { UnauthorizedError, ValidationError } from "@/lib/api/http-errors";
import { hashPassword } from "@/lib/auth/password";
import {
  LEAD_DUPLICATE_MESSAGE,
  LEAD_EXTRAS_MAX_KEYS,
  LEAD_INGEST_KEY_HEADER,
} from "@/lib/leads/constants";
import {
  ingestLeadFromSource,
  verifyLeadSourceIngest,
} from "@/lib/leads/ingest-lead";
import {
  extractLeadSourcePlainKey,
  readJsonBody,
  requireLeadSourceFromRequest,
} from "@/lib/leads/lead-source-auth";
import {
  createLeadSource,
  disconnectLeadSource,
  rotateLeadSourceKey,
} from "@/lib/leads/manage-lead-source";
import { todayLeadDate } from "@/lib/leads/normalize";
import { createProject } from "@/lib/projects/create-project";
import { seedSystemRoles } from "@/lib/rbac/seed-roles";
import { Lead, LeadSource, Project, User } from "@/models";
import { ingestLeadSchema } from "@/schemas/lead";
import { authContextFor, projectInput } from "@/tests/helpers/project-test-utils";

function ingestInput(
  overrides: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    message: string;
    servicesInterestedIn: string | null;
    leadDate: string;
    extras: Record<string, string>;
    idempotencyKey: string;
    pluginVersion: string;
  }> = {},
) {
  return ingestLeadSchema.parse({
    firstName: "Pat",
    email: "pat@example.com",
    phone: "+1 (555) 010-3000",
    message: "Need a quote.",
    idempotencyKey: "cf7-form-abc12345",
    pluginVersion: "1.0.0",
    ...overrides,
  });
}

async function seedConnectedSource() {
  await seedSystemRoles();

  const owner = await User.create({
    name: "Ingest Owner",
    email: "ingest-owner@example.com",
    password: await hashPassword("password"),
    emailVerifiedAt: new Date(),
    roles: [],
  });

  const { project } = await createProject(
    authContextFor(owner),
    projectInput({
      businessName: "Ingest Project",
      websiteUrl: "https://ingest.example.com",
    }),
  );
  await Project.findByIdAndUpdate(project._id, { status: "active" });

  const created = await createLeadSource(authContextFor(owner), project._id.toString());
  const source = await LeadSource.findById(created.source.id);
  if (!source) throw new Error("Lead source missing after create.");

  return { owner, project, source, plaintextKey: created.plaintextKey, auth: authContextFor(owner) };
}

describe("Lead ingest", () => {
  it("reads the lead source key from the dedicated header or bearer token", () => {
    const fromHeader = new Request("http://localhost/api/v1/leads/ingest/verify", {
      headers: { [LEAD_INGEST_KEY_HEADER]: " clx_ls_abc " },
    });
    expect(extractLeadSourcePlainKey(fromHeader)).toBe("clx_ls_abc");

    const fromBearer = new Request("http://localhost/api/v1/leads/ingest/verify", {
      headers: { authorization: "Bearer clx_ls_def" },
    });
    expect(extractLeadSourcePlainKey(fromBearer)).toBe("clx_ls_def");

    const missing = new Request("http://localhost/api/v1/leads/ingest/verify");
    expect(extractLeadSourcePlainKey(missing)).toBeNull();
  });

  it("verifies a connected key on an active project and stamps lastVerifiedAt", async () => {
    const { source } = await seedConnectedSource();

    const payload = await verifyLeadSourceIngest(source);
    expect(payload.source.id).toBe(String(source._id));
    expect(payload.source.provider).toBe("wordpress");

    const reloaded = await LeadSource.findById(source._id);
    expect(reloaded?.lastVerifiedAt).toBeInstanceOf(Date);
    expect(reloaded?.lastError).toBeNull();
  });

  it("rejects verify and ingest when the project is inactive", async () => {
    const { project, source } = await seedConnectedSource();
    await Project.findByIdAndUpdate(project._id, { status: "inactive" });

    await expect(verifyLeadSourceIngest(source)).rejects.toBeInstanceOf(ValidationError);
    await expect(ingestLeadFromSource(source, ingestInput())).rejects.toBeInstanceOf(ValidationError);

    const reloaded = await LeadSource.findById(source._id);
    expect(reloaded?.failedCount).toBe(1);
    expect(reloaded?.ingestCount).toBe(0);
    expect(reloaded?.lastError).toBeTruthy();
  });

  it("ingests a wordpress lead with extras, defaults leadDate, and attributes createdBy", async () => {
    const { owner, project, source } = await seedConnectedSource();

    const { lead, replayed } = await ingestLeadFromSource(
      source,
      ingestInput({
        lastName: "Lee",
        servicesInterestedIn: "Local SEO",
        extras: { Subject: "Pricing", firstName: "ignored-core" },
      }),
    );

    expect(replayed).toBe(false);
    expect(lead.origin).toBe("wordpress");
    expect(lead.leadDate).toBe(todayLeadDate());
    expect(lead.lastName).toBe("Lee");
    expect(lead.extras).toEqual({ Subject: "Pricing" });
    expect(String(lead.leadSourceId)).toBe(String(source._id));
    expect(String(lead.createdBy)).toBe(String(owner._id));
    expect(String(lead.projectId)).toBe(String(project._id));

    const reloaded = await LeadSource.findById(source._id);
    expect(reloaded?.ingestCount).toBe(1);
    expect(reloaded?.failedCount).toBe(0);
    expect(reloaded?.lastIngestedAt).toBeInstanceOf(Date);
    expect(reloaded?.lastError).toBeNull();
  });

  it("replays the same idempotencyKey without creating a second lead", async () => {
    const { source } = await seedConnectedSource();
    const input = ingestInput({ idempotencyKey: "retry-key-0001" });

    const first = await ingestLeadFromSource(source, input);
    const second = await ingestLeadFromSource(source, input);

    expect(second.replayed).toBe(true);
    expect(String(second.lead._id)).toBe(String(first.lead._id));
    expect(await Lead.countDocuments({ leadSourceId: source._id })).toBe(1);

    const reloaded = await LeadSource.findById(source._id);
    expect(reloaded?.ingestCount).toBe(1);
  });

  it("rejects a new submission with the same email and phone", async () => {
    const { source } = await seedConnectedSource();
    await ingestLeadFromSource(source, ingestInput({ idempotencyKey: "first-submit-01" }));

    await expect(
      ingestLeadFromSource(
        source,
        ingestInput({
          idempotencyKey: "second-submit-02",
        }),
      ),
    ).rejects.toMatchObject({
      message: LEAD_DUPLICATE_MESSAGE,
    });

    const reloaded = await LeadSource.findById(source._id);
    expect(reloaded?.failedCount).toBe(1);
    expect(reloaded?.ingestCount).toBe(1);
  });

  it("rejects a rotated or missing key", async () => {
    const { source, plaintextKey, auth } = await seedConnectedSource();

    await expect(
      requireLeadSourceFromRequest(new Request("http://localhost/api/v1/leads/ingest", {
        headers: { authorization: "Bearer not-a-real-key" },
      })),
    ).rejects.toBeInstanceOf(UnauthorizedError);

    await rotateLeadSourceKey(auth, String(source.projectId), String(source._id));

    await expect(
      requireLeadSourceFromRequest(new Request("http://localhost/api/v1/leads/ingest", {
        headers: { [LEAD_INGEST_KEY_HEADER]: plaintextKey },
      })),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("rejects a disconnected key", async () => {
    const { source, plaintextKey } = await seedConnectedSource();
    await disconnectLeadSource(String(source.projectId), String(source._id));

    await expect(
      requireLeadSourceFromRequest(new Request("http://localhost/api/v1/leads/ingest", {
        headers: { [LEAD_INGEST_KEY_HEADER]: plaintextKey },
      })),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("rejects too many extras and ignores unknown top-level fields", () => {
    const tooMany: Record<string, string> = {};
    for (let i = 0; i <= LEAD_EXTRAS_MAX_KEYS; i += 1) {
      tooMany[`extra-${i}`] = "value";
    }
    expect(() => ingestInput({ extras: tooMany })).toThrow();

    const parsed = ingestLeadSchema.parse({
      firstName: "Pat",
      email: "pat@example.com",
      phone: "+1 (555) 010-3000",
      message: "Need a quote.",
      idempotencyKey: "cf7-form-abc12345",
      pluginVersion: "1.0.0",
      Topic: "Should not land on the payload",
    } satisfies Record<string, string>);
    expect(parsed.extras).toEqual({});
    expect("Topic" in parsed).toBe(false);
  });

  it("rejects ingest JSON that exceeds the body cap", async () => {
    const request = new Request("http://localhost/api/v1/leads/ingest", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "x".repeat(80),
    });
    await expect(readJsonBody(request, 40)).rejects.toMatchObject({ statusCode: 413 });
  });

  it("rejects the public ingest route without a lead source key", async () => {
    const { POST } = await import("@/app/api/v1/leads/ingest/route");
    const response = await POST(
      new Request("http://localhost/api/v1/leads/ingest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      }),
    );
    expect(response.status).toBe(401);
  });

  it("verifies through the public route with a valid key", async () => {
    const { plaintextKey } = await seedConnectedSource();
    const { POST } = await import("@/app/api/v1/leads/ingest/verify/route");
    const response = await POST(
      new Request("http://localhost/api/v1/leads/ingest/verify", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          [LEAD_INGEST_KEY_HEADER]: plaintextKey,
        },
        body: JSON.stringify({ pluginVersion: "1.0.0" }),
      }),
    );
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.source.provider).toBe("wordpress");
  });
});
