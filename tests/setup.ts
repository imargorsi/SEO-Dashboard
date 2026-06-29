import { beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { resetRateLimitStore } from "@/lib/auth/rate-limit";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = `${mongo.getUri()}seo-dashboard?retryWrites=false`;
  process.env.APP_KEY = "base64:dGVzdC1hcHAta2V5LWZvci1sb2NhbC1kZXYtMDEyMzQ1Njc4";
  process.env.MAIL_MAILER = "log";
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  resetRateLimitStore();
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key]!.deleteMany({});
  }
});
