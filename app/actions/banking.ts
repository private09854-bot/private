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

// --- Card issuance ---------------------------------------------------------

const CARD_LIMIT = 5000;

/**
 * A random, Luhn-valid 16-digit VISA-style number. Non-functional demo value —
 * the platform is not connected to any card network.
 */
function randomCardNumber(): string {
  const digits = [4]; // VISA prefix
  while (digits.length < 15) digits.push(Math.floor(Math.random() * 10));
  // Luhn check digit
  let sum = 0;
  digits.forEach((d, i) => {
    // Position of the check digit is 16 (even from the right), so double the
    // digits at odd positions from the left in this 15-digit body.
    let v = d;
    if ((digits.length - i) % 2 === 1) {
      v *= 2;
      if (v > 9) v -= 9;
    }
    sum += v;
  });
  digits.push((10 - (sum % 10)) % 10);
  return digits.join("");
}

/** Three-digit demo CVV. */
function randomCvv(): string {
  return String(Math.floor(100 + Math.random() * 900));
}

/** Expiry four years out, MM/YY (uses the card's created date). */
function expiryFromNow(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String((d.getFullYear() + 4) % 100).padStart(2, "0");
  return `${mm}/${yy}`;
}

/** Cardholder name as it should read on the card. */
function holderName(user: {
  firstName?: string | null;
  lastName?: string | null;
  name: string;
}): string {
  const full =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.name;
  return full.toUpperCase();
}

/**
 * Issue a virtual card instantly. Details are drawn from the signed-in user,
 * so the holder name matches their account. One virtual card per customer.
 */
export async function createVirtualCard(): Promise<ActionResult> {
  const user = await requireCustomer();

  const { count } = await supabaseAdmin
    .from("cards")
    .select("*", { count: "exact", head: true })
    .eq("ownerId", user.id)
    .eq("type", "virtual");
  if ((count ?? 0) > 0) {
    return { error: "You already have a virtual card." };
  }

  const number = randomCardNumber();
  const { error } = await supabaseAdmin.from("cards").insert({
    ownerId: user.id,
    name: "Virtual Card",
    brand: "VISA",
    number,
    last4: number.slice(-4),
    cvv: randomCvv(),
    holder: holderName(user),
    expiry: expiryFromNow(),
    spent: 0,
    limit: CARD_LIMIT,
    frozen: false,
    type: "virtual",
    status: "active",
  });
  if (error) return { error: error.message };

  revalidatePath("/cards");
  return { ok: true, message: "Your virtual card is ready." };
}

/**
 * Request a physical card. It is created in a `pending` state — an admin would
 * mark it issued/shipped in a real system. One physical card per customer.
 */
export async function requestPhysicalCard(): Promise<ActionResult> {
  const user = await requireCustomer();

  const { count } = await supabaseAdmin
    .from("cards")
    .select("*", { count: "exact", head: true })
    .eq("ownerId", user.id)
    .eq("type", "physical");
  if ((count ?? 0) > 0) {
    return { error: "You have already requested a physical card." };
  }

  const number = randomCardNumber();
  const { error } = await supabaseAdmin.from("cards").insert({
    ownerId: user.id,
    name: "Physical Card",
    brand: "VISA",
    number,
    last4: number.slice(-4),
    cvv: randomCvv(),
    holder: holderName(user),
    expiry: expiryFromNow(),
    spent: 0,
    limit: CARD_LIMIT,
    frozen: false,
    type: "physical",
    status: "pending",
  });
  if (error) return { error: error.message };

  revalidatePath("/cards");
  return { ok: true, message: "Physical card requested." };
}
