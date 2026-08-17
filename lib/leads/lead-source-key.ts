import crypto from "crypto";

import { LEAD_SOURCE_KEY_BYTES, LEAD_SOURCE_KEY_PREFIX } from "@/lib/leads/constants";

export type TGeneratedLeadSourceKey = {
  plaintext: string;
  keyHash: string;
  keyPrefix: string;
};

export function hashLeadSourceKey(plain: string): string {
  return crypto.createHash("sha256").update(plain).digest("hex");
}

export function leadSourceKeyPrefix(plain: string): string {
  const secret = plain.startsWith(LEAD_SOURCE_KEY_PREFIX)
    ? plain.slice(LEAD_SOURCE_KEY_PREFIX.length)
    : plain;
  return secret.slice(-4);
}

export function generateLeadSourceKey(): TGeneratedLeadSourceKey {
  const secret = crypto.randomBytes(LEAD_SOURCE_KEY_BYTES).toString("hex");
  const plaintext = `${LEAD_SOURCE_KEY_PREFIX}${secret}`;
  return {
    plaintext,
    keyHash: hashLeadSourceKey(plaintext),
    keyPrefix: leadSourceKeyPrefix(plaintext),
  };
}
