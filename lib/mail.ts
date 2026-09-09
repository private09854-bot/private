import nodemailer from "nodemailer";

/**
 * Email the site owner. Sends via SMTP when the SMTP_* env vars are configured;
 * otherwise it degrades gracefully to a server-log line (so the demo works with
 * no credentials). Configure in .env.local:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SUPPORT_EMAIL
 */
export async function sendOwnerEmail(
  subject: string,
  text: string,
): Promise<{ sent: boolean }> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  const to = process.env.SUPPORT_EMAIL || "official.privatechat0378@gmail.com";

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log(
      `[support] email not configured — would notify ${to}\nSubject: ${subject}\n${text}`,
    );
    return { sent: false };
  }

  const port = Number(SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({ from: SMTP_USER, to, subject, text });
  return { sent: true };
}
