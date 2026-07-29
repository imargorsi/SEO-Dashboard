/**
 * One-time fix: drop the stale `activityType_1_sourceRowNumber_1` unique index
 * left over on `seoactivities` from an earlier Google Sheets-import schema.
 * `sourceRowNumber` no longer exists on the SeoActivity model (SEO Activities
 * are manual CRUD, not sheet-imported — see doc/integrations.md), but Mongoose
 * never drops indexes that are removed from the schema, so every doc still
 * gets indexed with `sourceRowNumber: null`, colliding on the 2nd+ create of
 * any activityType (E11000 duplicate key error).
 *
 * Run: npm run migrate:drop-seo-activity-index
 */
import { connectDb } from "../lib/db/mongoose";
import { SeoActivity } from "../models";

const STALE_INDEX_NAME = "activityType_1_sourceRowNumber_1";

async function main() {
  await connectDb();

  const indexes = await SeoActivity.collection.indexes();
  const staleIndex = indexes.find((index) => index.name === STALE_INDEX_NAME);

  if (!staleIndex) {
    console.log(`Index ${STALE_INDEX_NAME} not present — nothing to do.`);
    process.exit(0);
  }

  await SeoActivity.collection.dropIndex(STALE_INDEX_NAME);
  console.log(`Dropped stale index ${STALE_INDEX_NAME} from seoactivities.`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
