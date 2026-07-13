import { beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { resetRateLimitStore } from "@/lib/auth/rate-limit";

let mongo: MongoMemoryServer | undefined;
let usesExternalDatabase = false;

const TEST_ENV = {
  APP_KEY: "base64:dGVzdC1hcHAta2V5LWZvci1sb2NhbC1kZXYtMDEyMzQ1Njc4",
  APP_URL: "http://localhost:3000",
  BLOB_READ_WRITE_TOKEN: "test-blob-token",
  MAIL_MAILER: "log",
} as const;

async function connectTestDatabase() {
  const externalUri = process.env.MONGODB_TEST_URI?.trim();

  if (externalUri) {
    usesExternalDatabase = true;
    process.env.MONGODB_URI = externalUri;
    await mongoose.connect(externalUri);
    return;
  }

  mongo = await MongoMemoryServer.create({
    binary: {
      version: "7.0.23",
    },
    instance: {
      dbName: "seo-dashboard-test",
    },
  });
  const memoryUri = mongo.getUri();
  process.env.MONGODB_URI = memoryUri;
  await mongoose.connect(memoryUri);
}

beforeAll(async () => {
  Object.assign(process.env, TEST_ENV);

  try {
    await connectTestDatabase();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Could not start the test database. Set MONGODB_TEST_URI to a disposable MongoDB instance or reinstall mongodb-memory-server binaries. Original error: ${message}`,
    );
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (mongo && !usesExternalDatabase) {
    await mongo.stop();
  }
});

beforeEach(async () => {
  resetRateLimitStore();

  if (mongoose.connection.readyState !== 1) {
    return;
  }

  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key]!.deleteMany({});
  }
});
