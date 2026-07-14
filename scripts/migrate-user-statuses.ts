/**
 * One-time migration: backfill missing `User.status` to `active`.
 *
 * Run: npm run migrate:user-statuses
 */
import mongoose from "mongoose";

import { connectDb } from "../lib/db/mongoose";
import { User } from "../models";

async function main() {
  await connectDb();

  const result = await User.collection.updateMany(
    { $or: [{ status: { $exists: false } }, { status: null }] },
    { $set: { status: "active" } },
  );

  console.log(`Backfilled status=active on ${result.modifiedCount} user(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
