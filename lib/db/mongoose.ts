import mongoose, { type Mongoose } from "mongoose";
import { env } from "@/lib/config/env";

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/** Redact password; log host/db/authSource so Hostinger env mangling is visible. */
function describeMongodbUri(uri: string): Record<string, string | boolean | number> {
  try {
    const withoutScheme = uri.replace(/^mongodb(\+srv)?:\/\//, "");
    const at = withoutScheme.indexOf("@");
    const creds = at >= 0 ? withoutScheme.slice(0, at) : "";
    const rest = at >= 0 ? withoutScheme.slice(at + 1) : withoutScheme;
    const user = creds.split(":")[0] ?? "";
    const pass = creds.includes(":") ? creds.slice(creds.indexOf(":") + 1) : "";
    const [hostAndPath, query = ""] = rest.split("?", 2);
    const slash = hostAndPath.indexOf("/");
    const hosts = slash >= 0 ? hostAndPath.slice(0, slash) : hostAndPath;
    const db = slash >= 0 ? hostAndPath.slice(slash + 1) : "";
    const params = new URLSearchParams(query);
    return {
      protocol: uri.startsWith("mongodb+srv") ? "mongodb+srv" : "mongodb",
      user,
      passwordLength: pass.length,
      passwordSuffix: pass ? `…${pass.slice(-4)}` : "(empty)",
      hostCount: hosts.split(",").filter(Boolean).length,
      firstHost: hosts.split(",")[0] ?? "",
      database: db || "(none)",
      authSource: params.get("authSource") ?? "(default)",
      hasReplicaSet: params.has("replicaSet"),
      uriLength: uri.length,
    };
  } catch {
    return { parseError: true, uriLength: uri.length };
  }
}

/** Cached MongoDB connection for Next.js (safe across dev hot reload). */
export async function connectDb(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = env.mongodbUri();
    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
      })
      .catch((error) => {
        cached.promise = null;
        console.error("[mongodb] connection failed", describeMongodbUri(uri), error);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
