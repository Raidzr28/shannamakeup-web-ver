import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

const MAX_BYTES = 12 * 1024 * 1024;

/** Issues a short-lived token so the browser can upload straight to Blob
 * storage. Routing the bytes through a Server Action instead would cap us at
 * Next's 1 MB body limit (and Vercel's ~4.5 MB request ceiling), which every
 * phone photo exceeds. */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // The token is what authorises the write, so gate it on a real session.
        const user = await getCurrentUser();
        if (!user) throw new Error("Sign in to upload a photo.");

        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
          ],
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: user.id }),
        };
      },
      // No onUploadCompleted: the post row is written by createPostAction when
      // the form submits. Registering the callback would oblige Blob to reach a
      // public callbackUrl, which fails outright on localhost.
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 400 }
    );
  }
}
