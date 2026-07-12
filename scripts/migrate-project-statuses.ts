/**
 * One-time migration: `approved` → `active` on existing projects.
 *
 * Run: npm run migrate:project-statuses
 */
import { connectDb } from "../lib/db/mongoose";
import { Project } from "../models";

/** Legacy status removed from PROJECT_STATUSES — kept for one-time DB migration. */
const LEGACY_APPROVED_STATUS = "approved";

async function main() {
  await connectDb();

  const result = await Project.collection.updateMany(
    { status: LEGACY_APPROVED_STATUS },
    { $set: { status: "active" } },
  );

  console.log(`Migrated ${result.modifiedCount} project(s) from approved to active.`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
