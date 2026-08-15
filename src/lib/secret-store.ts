import "server-only";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
import { prisma } from "./prisma";

export const GEMINI_SECRET = "gemini_api_key";

/** Encryption key for stored credentials, derived from AUTH_SECRET.
 *
 * Deriving rather than using AUTH_SECRET directly keeps the session-signing
 * key and the encryption key distinct, so neither can be used in place of the
 * other. The salt is a constant on purpose: the input is already a
 * high-entropy secret, and a random salt would have to be stored beside the
 * ciphertext to be usable, buying nothing here.
 *
 * Throws when AUTH_SECRET is missing rather than falling back — an
 * unencrypted, or predictably encrypted, API key is worse than no feature. */
function encryptionKey() {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) {
    throw new Error("AUTH_SECRET is not set — cannot encrypt or read stored secrets.");
  }
  return scryptSync(secret, "shana:secret-store:v1", 32);
}

/** iv.tag.ciphertext, all base64. GCM so a tampered row fails to decrypt
 * rather than silently returning wrong bytes. */
function encrypt(plain: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const body = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [
    iv.toString("base64"),
    cipher.getAuthTag().toString("base64"),
    body.toString("base64"),
  ].join(".");
}

function decrypt(blob: string) {
  const [ivPart, tagPart, bodyPart] = blob.split(".");
  if (!ivPart || !tagPart || !bodyPart) return null;
  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      encryptionKey(),
      Buffer.from(ivPart, "base64")
    );
    decipher.setAuthTag(Buffer.from(tagPart, "base64"));
    const out = Buffer.concat([
      decipher.update(Buffer.from(bodyPart, "base64")),
      decipher.final(),
    ]);
    return out.toString("utf8");
  } catch {
    // Wrong AUTH_SECRET, or a tampered row. Treated as "no secret stored",
    // which degrades the assistant rather than breaking the page.
    console.error("stored secret could not be decrypted");
    return null;
  }
}

export async function setSecret(name: string, value: string, updatedBy: string) {
  const hint = value.slice(-4);
  const cipher = encrypt(value);
  await prisma.appSecret.upsert({
    where: { name },
    create: { name, cipher, hint, updatedBy },
    update: { cipher, hint, updatedBy },
  });
}

export async function clearSecret(name: string) {
  await prisma.appSecret.deleteMany({ where: { name } });
}

/** The plaintext. Server-side callers only — never return this to a page. */
export async function readSecret(name: string) {
  const row = await prisma.appSecret.findUnique({ where: { name } });
  if (!row) return null;
  return decrypt(row.cipher);
}

/** What the UI is allowed to know: that a key exists, its last four
 * characters, and when it was set. */
export async function secretMeta(name: string) {
  const row = await prisma.appSecret.findUnique({ where: { name } });
  if (!row) return null;
  return { hint: row.hint, updatedAt: row.updatedAt };
}
