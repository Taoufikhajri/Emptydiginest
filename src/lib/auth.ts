import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query, queryOne } from "./db";

export type User = {
  id: number;
  email: string;
  name: string;
  role: "customer" | "admin";
  createdAt: Date;
};

const SESSION_COOKIE = "dn_session";
const SESSION_DAYS = 30;
const RESET_HOURS = 1;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

// Only the token's hash is stored, so a leaked database can't be used to sign in.
export async function createSession(userId: number) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)", [
    hashToken(token),
    userId,
    expiresAt,
  ]);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await query("DELETE FROM sessions WHERE token_hash = $1", [hashToken(token)]);
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = await queryOne<{ id: number; email: string; name: string; role: User["role"]; created_at: Date }>(
    `SELECT u.id, u.email, u.name, u.role, u.created_at FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [hashToken(token)],
  );
  return row
    ? { id: row.id, email: row.email, name: row.name, role: row.role, createdAt: new Date(row.created_at) }
    : null;
}

export async function requireUser(next = "/account") {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/");
  return user;
}

// Returns a single-use reset token, or null when one was issued in the last minute (limits repeat emails).
export async function createPasswordReset(userId: number) {
  await query("DELETE FROM password_resets WHERE expires_at <= now()");
  const recent = await queryOne(
    "SELECT 1 FROM password_resets WHERE user_id = $1 AND created_at > now() - interval '1 minute'",
    [userId],
  );
  if (recent) return null;
  const token = randomBytes(32).toString("base64url");
  await query("INSERT INTO password_resets (token_hash, user_id, expires_at) VALUES ($1, $2, $3)", [
    hashToken(token),
    userId,
    new Date(Date.now() + RESET_HOURS * 60 * 60 * 1000),
  ]);
  return token;
}

export async function isPasswordResetValid(token: string) {
  const row = await queryOne("SELECT 1 FROM password_resets WHERE token_hash = $1 AND expires_at > now()", [hashToken(token)]);
  return Boolean(row);
}

// Sets the new password if the token is still valid. Deleting the token first makes it single-use, and
// signing out every device locks out anyone who was using the old password.
export async function resetPassword(token: string, passwordHash: string) {
  const row = await queryOne<{ user_id: number }>(
    "DELETE FROM password_resets WHERE token_hash = $1 AND expires_at > now() RETURNING user_id",
    [hashToken(token)],
  );
  if (!row) return false;
  await query("UPDATE users SET password_hash = $1 WHERE id = $2", [passwordHash, row.user_id]);
  await query("DELETE FROM sessions WHERE user_id = $1", [row.user_id]);
  await query("DELETE FROM password_resets WHERE user_id = $1", [row.user_id]);
  return true;
}

// Only allow same-site relative paths after login, so ?next= can't send people elsewhere.
export const safeNextPath = (value: FormDataEntryValue | string | null | undefined, fallback = "/account") => {
  const path = typeof value === "string" ? value : "";
  return path.startsWith("/") && !path.startsWith("//") ? path : fallback;
};
