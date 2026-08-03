import { z } from "zod";

export const upsertAdminUserMembershipSchema = z.object({
  projectId: z.string().min(1),
  roleId: z.string().min(1),
});

export type UpsertAdminUserMembershipInput = z.infer<typeof upsertAdminUserMembershipSchema>;
