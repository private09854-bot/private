"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireCustomer } from "@/lib/session";
import { getFxRate } from "@/lib/data";

export type ActionResult = { ok?: boolean; error?: string; message?: string };

// ---------------------------------------------------------------------------
// Send money to a saved recipient (atomic — see supabase/functions.sql)
// ---------------------------------------------------------------------------
export async function sendMoney(input: {
  recipientId: string;
  amount: number;
  currency: string;
  note?: string;
}): Promise<ActionResult> {
  const user = await requireCustomer();
  const amount = Number(input.amount);

  if (!input.recipientId) return { error: "Choose a recipient first." };
  if (!Number.isFinite(amount) || amount <= 0)
    return { error: "Enter an amount greater than zero." };

  const { error } = await supabaseAdmin.rpc("send_money", {
    p_owner: user.id,
    p_recipient: input.recipientId,
    p_amount: amount,
    p_currency: input.currency,
    p_note: input.note ?? null,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/wallets");
  revalidatePath("/transactions");
  revalidatePath("/send");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Convert between two of the customer's wallets (atomic)
// ---------------------------------------------------------------------------
export async function convertMoney(input: {
  from: string;
  to: string;
  amount: number;
}): Promise<ActionResult> {
  await requireCustomer();
  const amount = Number(input.amount);

  if (input.from === input.to)
    return { error: "Choose two different currencies." };
  if (!Number.isFinite(amount) || amount <= 0)
    return { error: "Enter an amount greater than zero." };

  const rate = await getFxRate(input.from, input.to);
  if (rate == null)
    return { error: `No exchange rate for ${input.from} → ${input.to}.` };

  const user = await requireCustomer();
  const { error } = await supabaseAdmin.rpc("convert_money", {
    p_owner: user.id,
    p_from: input.from,
    p_to: input.to,
    p_amount: amount,
    p_rate: rate,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/wallets");
  revalidatePath("/transactions");
  revalidatePath("/convert");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Recipients
// ---------------------------------------------------------------------------
export async function addRecipient(input: {
  name: string;
  handle?: string;
}): Promise<ActionResult> {
  const user = await requireCustomer();
  const name = input.name.trim();
  if (!name) return { error: "Enter a recipient name." };

  let handle = input.handle?.trim() || "";
  if (handle && !handle.startsWith("@")) handle = `@${handle}`;
  if (!handle) handle = `@${name.toLowerCase().replace(/\s+/g, "_")}`;

  const { error } = await supabaseAdmin
    .from("recipients")
    .insert({ ownerId: user.id, type: "USER", name, handle });
  if (error) return { error: error.message };

  revalidatePath("/recipients");
  revalidatePath("/send");
  return { ok: true };
}

export async function deleteRecipient(id: string): Promise<ActionResult> {
  const user = await requireCustomer();
  const { error } = await supabaseAdmin
    .from("recipients")
    .delete()
    .eq("id", id)
    .eq("ownerId", user.id);
  if (error) return { error: error.message };

  revalidatePath("/recipients");
  revalidatePath("/send");
  return { ok: true };
}

export async function toggleRecipientFavorite(
  id: string,
): Promise<ActionResult> {
  const user = await requireCustomer();
  const { data: rec } = await supabaseAdmin
    .from("recipients")
    .select("favorite")
    .eq("id", id)
    .eq("ownerId", user.id)
    .maybeSingle();
  if (!rec) return { error: "Recipient not found." };

  const { error } = await supabaseAdmin
    .from("recipients")
    .update({ favorite: !rec.favorite })
    .eq("id", id)
    .eq("ownerId", user.id);
  if (error) return { error: error.message };

  revalidatePath("/recipients");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
const TOGGLE_KEYS = [
  "twoFactor",
  "loginNotifications",
  "txnAlerts",
  "securityLog",
  "marketing",
  "fxTriggers",
] as const;
type ToggleKey = (typeof TOGGLE_KEYS)[number];

export async function updateSetting(
  key: string,
  value: boolean,
): Promise<ActionResult> {
  const user = await requireCustomer();
  if (!TOGGLE_KEYS.includes(key as ToggleKey))
    return { error: "Unknown setting." };

  const { error } = await supabaseAdmin
    .from("user_settings")
    .update({ [key]: value })
    .eq("ownerId", user.id);
  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { ok: true };
}

export async function removeDevice(id: string): Promise<ActionResult> {
  const user = await requireCustomer();
  const { error } = await supabaseAdmin
    .from("devices")
    .delete()
    .eq("id", id)
    .eq("ownerId", user.id)
    .eq("current", false);
  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------
export async function toggleCardFreeze(cardId: string): Promise<ActionResult> {
  const user = await requireCustomer();
  const { data: card } = await supabaseAdmin
    .from("cards")
    .select("frozen")
    .eq("id", cardId)
    .eq("ownerId", user.id)
    .maybeSingle();
  if (!card) return { error: "Card not found." };

  const { error } = await supabaseAdmin
    .from("cards")
    .update({ frozen: !card.frozen })
    .eq("id", cardId)
    .eq("ownerId", user.id);
  if (error) return { error: error.message };

  revalidatePath("/cards");
  return { ok: true };
}

export async function adjustCardLimit(
  cardId: string,
  newLimit: number,
): Promise<ActionResult> {
  const user = await requireCustomer();
  const limit = Number(newLimit);
  if (!Number.isFinite(limit) || limit <= 0)
    return { error: "Enter a valid limit." };

  const { error } = await supabaseAdmin
    .from("cards")
    .update({ limit })
    .eq("id", cardId)
    .eq("ownerId", user.id);
  if (error) return { error: error.message };

  revalidatePath("/cards");
  return { ok: true };
}
