import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getCurrentUser } from "@/lib/auth";

// The browser downscales before sending, so anything arriving here should be a
// few hundred KB. The ceiling is a guard, not the expected size.
const MAX_BYTES = 4 * 1024 * 1024;
const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
// Allowlisted rather than taken from the request, so a caller cannot steer the
// write anywhere it likes inside the store.
const FOLDERS = new Set(["posts", "avatars", "receipts"]);

/** Receives an already-compressed image and stores it in Blob.
 *
 * This is a Route Handler rather than a Server Action because actions cap
 * request bodies at 1 MB. Uploading straight from the browser to Blob with a
 * client token was tried first, but @vercel/blob 2.8.0 resolves its API host to
 * https://vercel.com/api/blob, which the browser rejects for CORS. */
export async function POST(request: Request): Promise<NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Sign in to upload a photo." },
      { status: 401 }
    );
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No photo received." }, { status: 400 });
  }
  if (!(file.type in EXT_BY_MIME)) {
    return NextResponse.json(
      { error: "That file type is not supported." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "That photo is too large." },
      { status: 413 }
    );
  }

  const requested = String(form.get("folder") ?? "posts");
  const folder = FOLDERS.has(requested) ? requested : "posts";

  try {
    const blob = await put(
      `${folder}/${randomUUID()}.${EXT_BY_MIME[file.type]}`,
      file,
      { access: "public", addRandomSuffix: false }
    );
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("blob upload failed", error);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 502 }
    );
  }
}
