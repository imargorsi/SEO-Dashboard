/**
 * One-time migration: rename SeoActivity.activityType `web_changes` → `technical_work`.
 *
 * Run: npm run migrate:seo-activity-types
 */
import mongoose from "mongoose";

import { connectDb } from "../lib/db/mongoose";
import { SeoActivity } from "../models";

async function main() {
  await connectDb();

  const result = await SeoActivity.collection.updateMany(
    { activityType: "web_changes" },
    { $set: { activityType: "technical_work" } },
  );

  console.log(
    `Renamed activityType web_changes → technical_work on ${result.modifiedCount} document(s) (matched ${result.matchedCount}).`,
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
