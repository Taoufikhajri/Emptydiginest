import { imageResponse } from "@/lib/images";
import { getLogo } from "@/lib/settings";

export async function GET(request: Request) {
  const logo = await getLogo();
  if (!logo) return new Response("Not found", { status: 404 });
  return imageResponse(request, logo.logo_type, logo.logo_data);
}
