import { markOrderPaid } from "@/lib/payments";
import { verifyBinanceSignature } from "@/lib/payments/binance";
import { getOrderByPublicId } from "@/lib/queries";

type BinanceWebhook = { bizType?: string; bizStatus?: string; data?: string };

const ack = () => Response.json({ returnCode: "SUCCESS", returnMessage: null });

export async function POST(request: Request) {
  const rawBody = await request.text();
  const valid = await verifyBinanceSignature(request.headers, rawBody).catch(() => false);
  if (!valid) {
    return Response.json({ returnCode: "FAIL", returnMessage: "invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody) as BinanceWebhook;
  if (body.bizType === "PAY" && body.bizStatus === "PAY_SUCCESS" && body.data) {
    const data = JSON.parse(body.data) as { merchantTradeNo?: string; totalFee?: number | string; currency?: string };
    const order = data.merchantTradeNo ? await getOrderByPublicId(data.merchantTradeNo) : null;
    // Compare with the USDT amount quoted when the order was created, not today's rate.
    const quoted = Number.parseFloat(order?.paymentAmount ?? "");
    if (order && data.currency === "USDT" && quoted > 0 && Number(data.totalFee) >= quoted) {
      await markOrderPaid(order.publicId);
    }
  }

  return ack();
}
