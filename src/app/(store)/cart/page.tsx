import type { Metadata } from "next";
import { CartView } from "@/components/store/cart-view";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Cart" };

export default async function CartPage() {
  const user = await getCurrentUser();
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-20 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-[-0.03em]">Your cart</h1>
      <div className="mt-6">
        <CartView signedIn={Boolean(user)} />
      </div>
    </div>
  );
}
