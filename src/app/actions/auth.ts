"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";
import { createPasswordReset, createSession, destroySession, resetPassword, safeNextPath } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { getI18n } from "@/lib/i18n/server";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getStoredSettings } from "@/lib/settings";
import { getBaseUrl } from "@/lib/url";

export type FormState = { error?: string; sent?: boolean } | undefined;

const registerSchema = z.object({
  name: z.string().trim().min(1, "auth.errName").max(80, "auth.errName"),
  email: z.email("auth.errEmail").transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8, "auth.errPassword").max(200, "auth.errPassword"),
});

export async function register(_state: FormState, formData: FormData): Promise<FormState> {
  const { t } = await getI18n();
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  // Schema messages are dictionary keys.
  if (!parsed.success) return { error: t(parsed.error.issues[0].message as Parameters<typeof t>[0]) };

  const existing = await queryOne("SELECT id FROM users WHERE email = $1", [parsed.data.email]);
  if (existing) return { error: t("auth.errExists") };

  const [user] = await query<{ id: number }>(
    "INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id",
    [parsed.data.email, parsed.data.name, await hashPassword(parsed.data.password)],
  );
  await createSession(user.id);
  redirect(safeNextPath(formData.get("next")));
}

export async function login(_state: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await queryOne<{ id: number; password_hash: string; role: string }>(
    "SELECT id, password_hash, role FROM users WHERE email = $1",
    [email],
  );
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return { error: (await getI18n()).t("auth.errWrong") };
  }
  await createSession(user.id);
  redirect(safeNextPath(formData.get("next"), user.role === "admin" ? "/admin" : "/account"));
}

// The answer is the same whether or not the account exists, so this can't reveal who has an account.
export async function requestPasswordReset(_state: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const user = await queryOne<{ id: number }>("SELECT id FROM users WHERE email = $1", [email]);
  // Without APP_URL the link would be built from request headers, which a caller can forge.
  if (process.env.NODE_ENV === "production" && !process.env.APP_URL) {
    console.error("Password reset skipped: set APP_URL so reset links point at your site.");
  } else if (user) {
    const token = await createPasswordReset(user.id);
    if (token) {
      const [{ t, info }, settings, baseUrl] = await Promise.all([getI18n(), getStoredSettings(), getBaseUrl()]);
      const store = settings.storeName;
      const message = {
        to: email,
        link: `${baseUrl}/reset-password?token=${token}`,
        subject: t("auth.resetEmailSubject", { store }),
        body: t("auth.resetEmailBody", { store }),
        button: t("auth.resetEmailButton"),
        ignore: t("auth.resetEmailIgnore"),
        dir: info.dir,
      };
      // Sent after responding, so response time doesn't reveal whether the account exists either.
      after(() => sendPasswordResetEmail(message).catch((error) => console.error("Password reset email failed:", error)));
    }
  }
  return { sent: true };
}

export async function submitNewPassword(_state: FormState, formData: FormData): Promise<FormState> {
  const { t } = await getI18n();
  const parsed = registerSchema.shape.password.safeParse(formData.get("password"));
  if (!parsed.success) return { error: t("auth.errPassword") };
  const updated = await resetPassword(String(formData.get("token") ?? ""), await hashPassword(parsed.data));
  if (!updated) return { error: t("auth.resetInvalid") };
  redirect("/login?reset=1");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
