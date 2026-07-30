/**
 * One-time migration: remove legacy `businessHours` from project documents.
 *
 * Run: npm run migrate:unset-business-hours
 */
import { connectDb } from "../lib/db/mongoose";
import { Project } from "../models";

async function main() {
  await connectDb();

  const result = await Project.collection.updateMany(
    { businessHours: { $exists: true } },
    { $unset: { businessHours: "" } },
  );

  console.log(`Removed businessHours from ${result.modifiedCount} project(s).`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
