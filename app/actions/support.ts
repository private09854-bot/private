"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSessionUser, requireAdmin } from "@/lib/session";
import { sendOwnerEmail } from "@/lib/mail";

export type SupportResult = { ok?: boolean; error?: string };

export type SupportMessage = {
  id: string;
  sender: "customer" | "admin";
  message: string;
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Customer side
// ---------------------------------------------------------------------------

/** A customer (or guest) sends a message into their support conversation. */
export async function sendSupportMessage(input: {
  message: string;
  name?: string;
  email?: string;
}): Promise<SupportResult> {
  const message = input.message?.trim();
  if (!message) return { error: "Type a message first." };
  if (message.length > 2000) return { error: "That message is too long." };

  const user = await getSessionUser();
  const name = input.name?.trim() || user?.name || "Guest";
  const email = input.email?.trim() || user?.email || "unknown@demo.local";

  const { error } = await supabaseAdmin.from("support_messages").insert({
    userId: user?.id ?? null,
    name,
    email,
    message,
    sender: "customer",
    readByAdmin: false,
    readByCustomer: true,
  });
  if (error) return { error: error.message };

  // Notify the owner (no-ops with a log line unless SMTP is configured).
  await sendOwnerEmail(
    `New support message from ${name}`,
    `From: ${name} <${email}>\nUser ID: ${user?.id ?? "n/a"}\n\nMessage:\n${message}`,
  ).catch((e) => console.error("[support] email failed:", e));

  revalidatePath("/admin/support");
  revalidatePath("/admin");
  return { ok: true };
}

/**
 * The signed-in customer's own conversation, oldest first. Marks any admin
 * replies as seen so the unread badge on their widget clears.
 */
export async function getMyConversation(): Promise<{
  messages: SupportMessage[];
  unread: number;
}> {
  const user = await getSessionUser();
  if (!user) return { messages: [], unread: 0 };

  const { data } = await supabaseAdmin
    .from("support_messages")
    .select("id,sender,message,createdAt,readByCustomer")
    .eq("userId", user.id)
    .order("createdAt");

  const rows = data ?? [];
  const unread = rows.filter(
    (m) => m.sender === "admin" && !m.readByCustomer,
  ).length;

  if (unread > 0) {
    await supabaseAdmin
      .from("support_messages")
      .update({ readByCustomer: true })
      .eq("userId", user.id)
      .eq("sender", "admin")
      .eq("readByCustomer", false);
  }

  return {
    messages: rows.map((m) => ({
      id: m.id,
      sender: m.sender,
      message: m.message,
      createdAt: m.createdAt,
    })),
    unread,
  };
}

/** How many admin replies the customer has not seen yet (for the badge). */
export async function getMyUnreadCount(): Promise<number> {
  const user = await getSessionUser();
  if (!user) return 0;
  const { count } = await supabaseAdmin
    .from("support_messages")
    .select("*", { count: "exact", head: true })
    .eq("userId", user.id)
    .eq("sender", "admin")
    .eq("readByCustomer", false);
  return count ?? 0;
}

// ---------------------------------------------------------------------------
// Admin side
// ---------------------------------------------------------------------------

/** The admin posts a reply into one customer's conversation. */
export async function replyToSupport(input: {
  userId: string;
  message: string;
}): Promise<SupportResult> {
  const admin = await requireAdmin();
  const message = input.message?.trim();
  if (!message) return { error: "Type a reply first." };
  if (message.length > 2000) return { error: "That reply is too long." };

  // Anchor the reply to the customer's identity from their existing messages.
  const { data: last } = await supabaseAdmin
    .from("support_messages")
    .select("name,email")
    .eq("userId", input.userId)
    .order("createdAt", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!last) return { error: "That conversation no longer exists." };

  const { error } = await supabaseAdmin.from("support_messages").insert({
    userId: input.userId,
    name: last.name,
    email: last.email,
    message,
    sender: "admin",
    readByAdmin: true,
    readByCustomer: false,
  });
  if (error) return { error: error.message };

  // Opening a conversation to reply implies the admin has read it.
  await supabaseAdmin
    .from("support_messages")
    .update({ readByAdmin: true })
    .eq("userId", input.userId)
    .eq("sender", "customer")
    .eq("readByAdmin", false);

  void admin;
  revalidatePath("/admin/support");
  revalidatePath("/admin");
  return { ok: true };
}

/** Mark a customer's inbound messages as read by the admin. */
export async function markConversationRead(
  userId: string,
): Promise<SupportResult> {
  await requireAdmin();
  const { error } = await supabaseAdmin
    .from("support_messages")
    .update({ readByAdmin: true })
    .eq("userId", userId)
    .eq("sender", "customer")
    .eq("readByAdmin", false);
  if (error) return { error: error.message };
  revalidatePath("/admin/support");
  revalidatePath("/admin");
  return { ok: true };
}
