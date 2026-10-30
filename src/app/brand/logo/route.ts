import { getLogo } from "@/lib/settings";

export async function GET(request: Request) {
  const logo = await getLogo();
  if (!logo) return new Response("Not found", { status: 404 });

  // Versioned URLs (?v=) change whenever a new logo is uploaded, so they can be cached for good.
  const versioned = new URL(request.url).searchParams.has("v");
  return new Response(Buffer.from(logo.logo_data, "base64"), {
    headers: {
      "Content-Type": logo.logo_type,
      "Cache-Control": versioned ? "public, max-age=31536000, immutable" : "no-cache",
      // SVG logos can contain scripts; never let them run if the file is opened directly.
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
