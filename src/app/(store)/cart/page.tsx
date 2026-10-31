import type { Metadata } from "next";
import { CartView } from "@/components/store/cart-view";
import { getCurrentUser } from "@/lib/auth";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("cart.metaTitle") };
}

export default async function CartPage() {
  const [user, { t }] = await Promise.all([getCurrentUser(), getI18n()]);
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-20 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-[-0.03em]">{t("cart.title")}</h1>
      <div className="mt-6">
        <CartView signedIn={Boolean(user)} />
      </div>
    </div>
  );
}
