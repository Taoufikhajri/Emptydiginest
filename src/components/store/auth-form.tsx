"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { login, register, requestPasswordReset, submitNewPassword } from "@/app/actions/auth";
import { useI18n } from "@/components/i18n-provider";

const inputClass =
  "mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none";

export function AuthForm({ mode, next }: { mode: "login" | "register"; next?: string }) {
  const [state, action, pending] = useActionState(mode === "login" ? login : register, undefined);
  const { t } = useI18n();
  const query = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      {mode === "register" && (
        <label className="block text-sm font-medium">
          {t("auth.name")}
          <input name="name" required autoComplete="name" maxLength={80} className={inputClass} />
        </label>
      )}
      <label className="block text-sm font-medium">
        {t("auth.email")}
        <input name="email" type="email" required autoComplete="email" className={inputClass} />
      </label>
      <label className="block text-sm font-medium">
        {t("auth.password")}
        <input
          name="password"
          type="password"
          required
          minLength={mode === "register" ? 8 : undefined}
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          className={inputClass}
        />
        {mode === "register" && <span className="mt-1 block text-xs text-muted-foreground">{t("auth.passwordHint")}</span>}
      </label>
      {mode === "login" && (
        <p className="-mt-2 text-end text-sm">
          <Link href="/forgot-password" className="font-semibold text-primary hover:underline">
            {t("auth.forgotLink")}
          </Link>
        </p>
      )}
      {state?.error && (
        <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        {mode === "login" ? t("auth.signIn") : t("auth.createAccount")}
      </button>
      <p className="text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            {t("auth.newHere")}{" "}
            <Link href={`/register${query}`} className="font-semibold text-primary hover:underline">
              {t("auth.createLink")}
            </Link>
          </>
        ) : (
          <>
            {t("auth.haveAccount")}{" "}
            <Link href={`/login${query}`} className="font-semibold text-primary hover:underline">
              {t("auth.signIn")}
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      {state?.sent ? (
        <p role="status" className="rounded-xl bg-secondary px-3 py-2 text-sm">
          {t("auth.forgotSent")}
        </p>
      ) : (
        <form action={action} className="space-y-4">
          <label className="block text-sm font-medium">
            {t("auth.email")}
            <input name="email" type="email" required autoComplete="email" className={inputClass} />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            {t("auth.forgotSubmit")}
          </button>
        </form>
      )}
      <p className="text-center text-sm">
        <Link href="/login" className="font-semibold text-primary hover:underline">
          {t("auth.backToSignIn")}
        </Link>
      </p>
    </div>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(submitNewPassword, undefined);
  const { t } = useI18n();

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <label className="block text-sm font-medium">
        {t("auth.newPassword")}
        <input name="password" type="password" required minLength={8} autoComplete="new-password" className={inputClass} />
        <span className="mt-1 block text-xs text-muted-foreground">{t("auth.passwordHint")}</span>
      </label>
      {state?.error && (
        <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        {t("auth.resetSubmit")}
      </button>
    </form>
  );
}
