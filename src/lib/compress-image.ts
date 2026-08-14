const MAX_EDGE = 1600;
const QUALITY = 0.85;

/** Downscales a photo in the browser before upload.
 *
 * A phone photo is 3-12 MB, which no server route on Vercel will accept, and
 * the feed never renders wider than ~800px anyway. Longest edge is capped at
 * 1600px and re-encoded as JPEG, which lands typically under 500 KB. */
export async function compressImage(file: File): Promise<File> {
  // Nothing useful to do with formats canvas cannot re-encode losslessly.
  if (file.type === "image/gif") return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return file;
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", QUALITY)
  );
  if (!blob) return file;

  // If re-encoding somehow made it bigger (already-small images), keep the original.
  if (blob.size >= file.size && scale === 1) return file;

  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {
    type: "image/jpeg",
  });
}
