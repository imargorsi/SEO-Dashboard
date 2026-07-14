import { z } from "zod";

export const inviteProjectMemberSchema = z.object({
  userId: z.string().trim().min(1, "User Is Required."),
});

export type InviteProjectMemberInput = z.infer<typeof inviteProjectMemberSchema>;

export const lookupUsersQuerySchema = z.object({
  search: z.string().trim().min(2, "Search Must Be At Least 2 Characters."),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

export type LookupUsersQueryInput = z.infer<typeof lookupUsersQuerySchema>;

export function parseLookupUsersQuery(searchParams: URLSearchParams): LookupUsersQueryInput {
  return lookupUsersQuerySchema.parse({
    search: searchParams.get("search") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });
}
