import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/store/auth-form";
import { getCurrentUser, safeNextPath } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const nextPath = next ? safeNextPath(next) : undefined;
  if (await getCurrentUser()) redirect(nextPath ?? "/account");

  return (
    <div className="mx-auto max-w-md px-4 pt-12 pb-20">
      <div className="rounded-(--store-radius) bg-card p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08)] sm:p-8">
        <h1 className="text-2xl font-semibold tracking-[-0.03em]">Sign in</h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">Access your orders and check out faster.</p>
        <AuthForm mode="login" next={nextPath} />
      </div>
    </div>
  );
}
