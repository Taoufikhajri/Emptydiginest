import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/store/auth-form";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("auth.forgotMeta") };
}

export default async function ForgotPasswordPage() {
  const { t } = await getI18n();

  return (
    <div className="mx-auto max-w-md px-4 pt-12 pb-20">
      <div className="rounded-(--store-radius) bg-card p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08)] sm:p-8">
        <h1 className="text-2xl font-semibold tracking-[-0.03em]">{t("auth.forgotTitle")}</h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">{t("auth.forgotIntro")}</p>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
