import type { Metadata } from "next";
import { CheckoutForm, type CheckoutProvider } from "@/components/store/checkout-form";
import { requireUser } from "@/lib/auth";
import { isDemoProvider, isProviderAvailable, providers } from "@/lib/payments";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  const available: CheckoutProvider[] = Object.values(providers)
    .filter((provider) => isProviderAvailable(provider.id))
    .map((provider) => ({
      id: provider.id,
      label: provider.label,
      description: provider.description,
      demo: isDemoProvider(provider.id),
    }));

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-20 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-[-0.03em]">Checkout</h1>
      <div className="mt-6">
        <CheckoutForm providers={available} email={user.email} />
      </div>
    </div>
  );
}
