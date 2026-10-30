import Link from "next/link";
import { ArrowRight, Bitcoin, Coins, DollarSign, Wallet } from "lucide-react";

const paymentMethods = ["Bitcoin", "Ethereum", "USDT", "Binance Pay"];
const paymentIcons = [Bitcoin, Coins, DollarSign, Wallet];

export function Guarantee() {
  return (
    <section className="border-t border-border/70 bg-background">
      <div className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8 lg:pt-16">
        <p className="text-lg font-semibold text-foreground">Something wrong?</p>
        <div className="mt-3 grid gap-6 lg:grid-cols-[auto_auto_1fr] lg:items-start lg:gap-10">
          <div>
            <p className="text-[clamp(2.8rem,8vw,6rem)] leading-[0.95] font-semibold tracking-[-0.04em] text-foreground">
              Replaced.
            </p>
            <p className="mt-3 max-w-[44ch] text-sm text-muted-foreground">
              We fix it or send you a fresh one for the plan you picked.
            </p>
          </div>
          <span className="text-sm font-semibold text-muted-foreground lg:pt-10">or</span>
          <div>
            <p className="text-[clamp(2.8rem,8vw,6rem)] leading-[0.95] font-semibold tracking-[-0.04em] text-signal-emerald">
              Refunded.
            </p>
            <p className="mt-3 max-w-[44ch] text-sm text-muted-foreground">
              If it can&apos;t be fixed, you get back the unused part of your order, or all of it if it never worked.
            </p>
          </div>
        </div>
        <Link
          href="/guarantee"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          How the guarantee works
          <ArrowRight className="size-4" />
        </Link>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <span className="text-sm font-medium text-muted-foreground sm:me-3">Pay with</span>
          <div className="flex flex-wrap gap-3">
            {paymentMethods.map((method, index) => {
              const Icon = paymentIcons[index % paymentIcons.length];
              return (
                <span
                  key={method}
                  className="inline-flex h-12 items-center gap-2 rounded-2xl bg-card px-5 text-sm font-semibold text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                >
                  <Icon className="size-4 text-muted-foreground" />
                  {method}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
