import { createPrivateKey } from "crypto";
import { readFileSync, writeFileSync } from "fs";

const line = readFileSync(".env.production.local", "utf8")
  .split(/\r?\n/)
  .find((l) => l.startsWith("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="));

if (!line) throw new Error("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY missing");

let raw = line.slice("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=".length).trim();
if (
  (raw.startsWith('"') && raw.endsWith('"')) ||
  (raw.startsWith("'") && raw.endsWith("'"))
) {
  raw = raw.slice(1, -1);
}

let pem = raw.trim();
while (pem.includes("\\n")) pem = pem.replace(/\\n/g, "\n");
pem = pem
  .split("\n")
  .map((line) => (line.startsWith("-----") ? line : line.replace(/ /g, "+")))
  .join("\n");

createPrivateKey(pem);
const b64 = Buffer.from(pem, "utf8").toString("base64");
writeFileSync("scripts/_hostinger-sa-key.b64.txt", b64, "utf8");
console.log("decode: OK");
console.log("wrote: scripts/_hostinger-sa-key.b64.txt");
console.log("chars:", b64.length);
console.log("Paste that entire file contents as GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY on Hostinger (no quotes).");
