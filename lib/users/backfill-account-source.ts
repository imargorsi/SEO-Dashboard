import { resolveAccountSource } from "@/lib/users/account-source";
import { User } from "@/models/User";

/**
 * One-time / idempotent backfill of `accountSource` for legacy users.
 * Safe to re-run: only writes when missing, null, or `unknown`.
 */
export async function backfillUserAccountSources(): Promise<{ matched: number; modified: number }> {
  const users = await User.find({
    $or: [
      { accountSource: { $exists: false } },
      { accountSource: null },
      { accountSource: "unknown" },
    ],
  }).select("_id googleId emailVerifiedAt createdAt accountSource");

  let modified = 0;

  for (const user of users) {
    const next = resolveAccountSource(user);
    if (user.accountSource === next) continue;
    user.accountSource = next;
    await user.save();
    modified += 1;
  }

  return { matched: users.length, modified };
}
