import { queryOne } from "@/lib/db";
import { imageResponse } from "@/lib/images";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const image = Number.isInteger(id)
    ? await queryOne<{ content_type: string; data: string }>(
        "SELECT content_type, data FROM product_images WHERE product_id = $1",
        [id],
      )
    : null;
  if (!image) return new Response("Not found", { status: 404 });
  return imageResponse(request, image.content_type, image.data);
}
