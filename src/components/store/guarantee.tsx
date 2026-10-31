import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";

// Official symbols, fetched from Brandfetch into public/payments.
const paymentMethods = [
  { name: "Bitcoin", logo: "/payments/bitcoin.svg" },
  { name: "Ethereum", logo: "/payments/ethereum.svg" },
  { name: "USDT", logo: "/payments/usdt.svg" },
  { name: "Binance Pay", logo: "/payments/binance-pay.svg" },
];

export async function Guarantee() {
  const { t } = await getI18n();
  return (
    <section className="border-t border-border/70 bg-background">
      <div className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8 lg:pt-16">
        <p className="text-lg font-semibold text-foreground">{t("guarantee.question")}</p>
        <div className="mt-3 grid gap-6 lg:grid-cols-[auto_auto_1fr] lg:items-start lg:gap-10">
          <div>
            <p className="text-[clamp(2.8rem,8vw,6rem)] leading-[0.95] font-semibold tracking-[-0.04em] text-foreground">
              {t("guarantee.replaced")}
            </p>
            <p className="mt-3 max-w-[44ch] text-sm text-muted-foreground">
              {t("guarantee.replacedBody")}
            </p>
          </div>
          <span className="text-sm font-semibold text-muted-foreground lg:pt-10">{t("guarantee.or")}</span>
          <div>
            <p className="text-[clamp(2.8rem,8vw,6rem)] leading-[0.95] font-semibold tracking-[-0.04em] text-signal-emerald">
              {t("guarantee.refunded")}
            </p>
            <p className="mt-3 max-w-[44ch] text-sm text-muted-foreground">
              {t("guarantee.refundedBody")}
            </p>
          </div>
        </div>
        <Link
          href="/guarantee"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          {t("guarantee.how")}
          <ArrowRight className="size-4 rtl:-scale-x-100" />
        </Link>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <span className="text-sm font-medium text-muted-foreground sm:me-3">{t("guarantee.payWith")}</span>
          <div className="flex flex-wrap gap-3">
            {paymentMethods.map((method) => (
              <span
                key={method.name}
                className="inline-flex h-12 items-center gap-2 rounded-2xl bg-card px-5 text-sm font-semibold text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- tiny static SVGs, nothing to optimize */}
                <img src={method.logo} alt="" className="size-5 object-contain" />
                {method.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
