import { markOrderPaid } from "@/lib/payments";
import { verifyNowPaymentsSignature } from "@/lib/payments/nowpayments";
import { getOrderByPublicId } from "@/lib/queries";

type NowPaymentsIpn = {
  payment_status?: string;
  order_id?: string;
  price_amount?: number;
  price_currency?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as NowPaymentsIpn | null;
  if (!body || !verifyNowPaymentsSignature(body, request.headers.get("x-nowpayments-sig"))) {
    return Response.json({ error: "invalid signature" }, { status: 401 });
  }

  if (body.payment_status === "finished" && body.order_id) {
    const order = await getOrderByPublicId(body.order_id);
    const amountMatches =
      order &&
      body.price_currency?.toUpperCase() === order.currency &&
      Math.round(Number(body.price_amount) * 100) >= order.totalCents;
    if (amountMatches) {
      await markOrderPaid(order.publicId);
    }
  }

  return Response.json({ ok: true });
}
