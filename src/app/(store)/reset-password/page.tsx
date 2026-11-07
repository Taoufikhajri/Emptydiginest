import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/store/auth-form";
import { isPasswordResetValid } from "@/lib/auth";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  // The URL holds the reset token, so keep it out of referrers and search results.
  return { title: t("auth.resetMeta"), referrer: "no-referrer", robots: { index: false } };
}

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const valid = typeof token === "string" && (await isPasswordResetValid(token));
  const { t } = await getI18n();

  return (
    <div className="mx-auto max-w-md px-4 pt-12 pb-20">
      <div className="rounded-(--store-radius) bg-card p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08)] sm:p-8">
        <h1 className="text-2xl font-semibold tracking-[-0.03em]">{t("auth.resetTitle")}</h1>
        {valid ? (
          <>
            <p className="mt-1 mb-6 text-sm text-muted-foreground">{t("auth.resetIntro")}</p>
            <ResetPasswordForm token={token} />
          </>
        ) : (
          <>
            <p role="alert" className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {t("auth.resetInvalid")}
            </p>
            <p className="mt-4 text-center text-sm">
              <Link href="/forgot-password" className="font-semibold text-primary hover:underline">
                {t("auth.resetRequestNew")}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
