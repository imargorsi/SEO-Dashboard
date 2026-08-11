/**
 * One-time / idempotent migration: backfill `User.accountSource` for legacy rows.
 * Soft heuristic — see `lib/users/account-source.ts`.
 *
 * Run: npm run migrate:user-account-sources
 * Prod: npm run migrate:prod:user-account-sources
 */
import mongoose from "mongoose";

import { connectDb } from "../lib/db/mongoose";
import { backfillUserAccountSources } from "../lib/users/backfill-account-source";

async function main() {
  await connectDb();

  const result = await backfillUserAccountSources();
  console.log(
    `Account source backfill: matched ${result.matched}, modified ${result.modified} user(s).`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
