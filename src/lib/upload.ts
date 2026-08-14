import "server-only";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";

const MAX_BYTES = 8 * 1024 * 1024;
const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/** Uploads an image to Vercel Blob and returns its public URL, or null if `file` is empty/invalid. */
export async function saveUpload(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (!(file.type in EXT_BY_MIME)) return null;
  if (file.size > MAX_BYTES) return null;

  const name = `uploads/${randomUUID()}.${EXT_BY_MIME[file.type]}`;
  const blob = await put(name, file, {
    access: "public",
    addRandomSuffix: false,
  });
  return blob.url;
}
