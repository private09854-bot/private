"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/session";
import { sendOwnerEmail } from "@/lib/mail";

export type SupportResult = { ok?: boolean; error?: string };

export async function sendSupportMessage(input: {
  message: string;
  name?: string;
  email?: string;
}): Promise<SupportResult> {
  const message = input.message?.trim();
  if (!message) return { error: "Type a message first." };

  const user = await getSessionUser();
  const name = input.name?.trim() || user?.name || "Guest";
  const email = input.email?.trim() || user?.email || "unknown@demo.local";

  const { error } = await supabaseAdmin
    .from("support_messages")
    .insert({ userId: user?.id ?? null, name, email, message });
  if (error) return { error: error.message };

  // Notify the owner (no-ops with a log line unless SMTP is configured).
  await sendOwnerEmail(
    `New support message from ${name}`,
    `From: ${name} <${email}>\nUser ID: ${user?.id ?? "n/a"}\n\nMessage:\n${message}`,
  ).catch((e) => console.error("[support] email failed:", e));

  return { ok: true };
}
