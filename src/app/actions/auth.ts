"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, destroySession, safeNextPath } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";

export type FormState = { error?: string } | undefined;

const registerSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(80),
  email: z.email("Enter a valid email address.").transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8, "Use at least 8 characters for your password.").max(200),
});

export async function register(_state: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const existing = await queryOne("SELECT id FROM users WHERE email = $1", [parsed.data.email]);
  if (existing) return { error: "An account with this email already exists. Sign in instead." };

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
    return { error: "Wrong email or password." };
  }
  await createSession(user.id);
  redirect(safeNextPath(formData.get("next"), user.role === "admin" ? "/admin" : "/account"));
}

export async function logout() {
  await destroySession();
  redirect("/");
}
