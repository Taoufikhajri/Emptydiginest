import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/store/auth-form";
import { getCurrentUser, safeNextPath } from "@/lib/auth";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("auth.signInMeta") };
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const nextPath = next ? safeNextPath(next) : undefined;
  if (await getCurrentUser()) redirect(nextPath ?? "/account");
  const { t } = await getI18n();

  return (
    <div className="mx-auto max-w-md px-4 pt-12 pb-20">
      <div className="rounded-(--store-radius) bg-card p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08)] sm:p-8">
        <h1 className="text-2xl font-semibold tracking-[-0.03em]">{t("auth.signInTitle")}</h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">{t("auth.signInIntro")}</p>
        <AuthForm mode="login" next={nextPath} />
      </div>
    </div>
  );
}
