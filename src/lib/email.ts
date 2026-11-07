type PasswordResetEmail = {
  to: string;
  link: string;
  subject: string;
  body: string;
  button: string;
  ignore: string;
  dir: "ltr" | "rtl";
};

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Sends through the Resend HTTP API, because hosts like Railway block outgoing SMTP on most plans.
export async function sendPasswordResetEmail({ to, link, subject, body, button, ignore, dir }: PasswordResetEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    // The link is a secret, so it only goes to the console during development.
    if (process.env.NODE_ENV === "production") {
      console.error("Password reset email not sent: set RESEND_API_KEY and EMAIL_FROM.");
    } else {
      console.log(`Password reset link for ${to}: ${link}`);
    }
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to,
      subject,
      text: `${body}\n\n${link}\n\n${ignore}`,
      html: `<div dir="${dir}" style="font-family:sans-serif;font-size:15px;line-height:1.5;color:#111">
<p>${escapeHtml(body)}</p>
<p><a href="${escapeHtml(link)}" style="display:inline-block;padding:10px 18px;border-radius:999px;background:#111;color:#fff;text-decoration:none;font-weight:600">${escapeHtml(button)}</a></p>
<p style="color:#666;font-size:13px">${escapeHtml(ignore)}</p>
</div>`,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Resend responded with ${response.status}`);
}
