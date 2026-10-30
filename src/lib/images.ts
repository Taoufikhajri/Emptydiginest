// Uploaded images (store logo, product images) are stored in the database as base64.

export const imageTypes = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];
export const MAX_IMAGE_BYTES = 500 * 1024;
export const imageAccept = imageTypes.join(",");

// Returns an error message, or null when the file is a valid image (or no file was chosen).
export function checkImageUpload(file: FormDataEntryValue | null, label: string) {
  if (!(file instanceof File) || file.size === 0) return null;
  if (!imageTypes.includes(file.type)) return `Upload the ${label} as PNG, JPG, WebP, GIF or SVG.`;
  if (file.size > MAX_IMAGE_BYTES) return `The ${label} must be 500 KB or smaller.`;
  return null;
}

export async function readImageUpload(file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size === 0) return null;
  return { contentType: file.type, base64: Buffer.from(await file.arrayBuffer()).toString("base64") };
}

export function imageResponse(request: Request, contentType: string, base64: string) {
  // Versioned URLs (?v=) change whenever a new image is uploaded, so they can be cached for good.
  const versioned = new URL(request.url).searchParams.has("v");
  return new Response(Buffer.from(base64, "base64"), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": versioned ? "public, max-age=31536000, immutable" : "no-cache",
      // SVG images can contain scripts; never let them run if the file is opened directly.
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
