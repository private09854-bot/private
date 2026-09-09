"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCustomer } from "@/lib/session";
import { getFxRate } from "@/lib/data";

export type ActionResult = { ok?: boolean; error?: string; message?: string };

/** Next sequential transaction reference, e.g. TXN-2026-00857. */
async function nextTxnRef(): Promise<string> {
  const count = await prisma.transaction.count();
  return `TXN-2026-${String(847 + count).padStart(5, "0")}`;
}

// ---------------------------------------------------------------------------
// Send money to a saved Vault user
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

  const recipient = await prisma.recipient.findFirst({
    where: { id: input.recipientId, ownerId: user.id },
  });
  if (!recipient) return { error: "That recipient could not be found." };

  const wallet = await prisma.wallet.findFirst({
    where: { ownerId: user.id, currency: input.currency },
  });
  if (!wallet) return { error: `You don't hold a ${input.currency} wallet.` };
  if (wallet.balance < amount)
    return { error: "Insufficient balance in that wallet." };

  const settings = await prisma.userSettings.findUnique({
    where: { ownerId: user.id },
  });
  if (settings && amount > settings.singleCap)
    return {
      error: `Amount exceeds your single-transfer cap of ${settings.singleCap.toLocaleString()} ${input.currency}.`,
    };

  const ref = await nextTxnRef();

  await prisma.$transaction([
    prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { decrement: amount },
        available: wallet.available != null ? { decrement: amount } : undefined,
      },
    }),
    prisma.transaction.create({
      data: {
        ref,
        ownerId: user.id,
        date: new Date(),
        kind: "send",
        title: recipient.name,
        sub: recipient.handle ?? "Vault user",
        currency: input.currency,
        amount: -amount,
        fee: 0,
        status: "Completed",
        party: recipient.name,
        partySub: recipient.handle ?? undefined,
        route: "Internal",
        risk: "Low",
        reference: input.note?.trim() || undefined,
        walletSource: `${input.currency} Wallet`,
        delivery: "Instantaneous",
      },
    }),
    prisma.recipient.update({
      where: { id: recipient.id },
      data: { lastSent: new Date() },
    }),
    ...(settings
      ? [
          prisma.userSettings.update({
            where: { ownerId: user.id },
            data: { dailyUsed: { increment: amount } },
          }),
        ]
      : []),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/wallets");
  revalidatePath("/transactions");
  revalidatePath("/send");
  return { ok: true, message: `Sent ${amount} ${input.currency} to ${recipient.name}.`, };
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

  await prisma.recipient.create({
    data: { ownerId: user.id, type: "USER", name, handle },
  });
  revalidatePath("/recipients");
  revalidatePath("/send");
  return { ok: true };
}

export async function deleteRecipient(id: string): Promise<ActionResult> {
  const user = await requireCustomer();
  await prisma.recipient.deleteMany({ where: { id, ownerId: user.id } });
  revalidatePath("/recipients");
  revalidatePath("/send");
  return { ok: true };
}

export async function toggleRecipientFavorite(
  id: string,
): Promise<ActionResult> {
  const user = await requireCustomer();
  const rec = await prisma.recipient.findFirst({
    where: { id, ownerId: user.id },
  });
  if (!rec) return { error: "Recipient not found." };
  await prisma.recipient.update({
    where: { id },
    data: { favorite: !rec.favorite },
  });
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
  await prisma.userSettings.update({
    where: { ownerId: user.id },
    data: { [key]: value },
  });
  revalidatePath("/settings");
  return { ok: true };
}

export async function removeDevice(id: string): Promise<ActionResult> {
  const user = await requireCustomer();
  await prisma.device.deleteMany({
    where: { id, ownerId: user.id, current: false },
  });
  revalidatePath("/settings");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------
export async function toggleCardFreeze(cardId: string): Promise<ActionResult> {
  const user = await requireCustomer();
  const card = await prisma.card.findFirst({
    where: { id: cardId, ownerId: user.id },
  });
  if (!card) return { error: "Card not found." };
  await prisma.card.update({
    where: { id: cardId },
    data: { frozen: !card.frozen },
  });
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
  const card = await prisma.card.findFirst({
    where: { id: cardId, ownerId: user.id },
  });
  if (!card) return { error: "Card not found." };
  await prisma.card.update({ where: { id: cardId }, data: { limit } });
  revalidatePath("/cards");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Convert between two of the customer's wallets
// ---------------------------------------------------------------------------
export async function convertMoney(input: {
  from: string;
  to: string;
  amount: number;
}): Promise<ActionResult> {
  const user = await requireCustomer();
  const amount = Number(input.amount);

  if (input.from === input.to)
    return { error: "Choose two different currencies." };
  if (!Number.isFinite(amount) || amount <= 0)
    return { error: "Enter an amount greater than zero." };

  const rate = await getFxRate(input.from, input.to);
  if (rate == null)
    return { error: `No exchange rate for ${input.from} → ${input.to}.` };

  const fromWallet = await prisma.wallet.findFirst({
    where: { ownerId: user.id, currency: input.from },
  });
  const toWallet = await prisma.wallet.findFirst({
    where: { ownerId: user.id, currency: input.to },
  });
  if (!fromWallet || !toWallet)
    return { error: "You need wallets in both currencies." };
  if (fromWallet.balance < amount)
    return { error: "Insufficient balance to convert." };

  const fee = amount * 0.0025; // 0.25% conversion fee
  const received = (amount - fee) * rate;
  const ref = await nextTxnRef();

  await prisma.$transaction([
    prisma.wallet.update({
      where: { id: fromWallet.id },
      data: {
        balance: { decrement: amount },
        available:
          fromWallet.available != null ? { decrement: amount } : undefined,
      },
    }),
    prisma.wallet.update({
      where: { id: toWallet.id },
      data: {
        balance: { increment: received },
        available:
          toWallet.available != null ? { increment: received } : undefined,
      },
    }),
    prisma.transaction.create({
      data: {
        ref,
        ownerId: user.id,
        date: new Date(),
        kind: "convert",
        title: `${input.from} → ${input.to} conversion`,
        sub: "Internal wallet loop",
        currency: input.to,
        amount: received,
        fee,
        status: "Completed",
        party: "FX Desk",
        partySub: `${input.from} → ${input.to}`,
        route: "FX Swap",
        risk: "Low",
        walletSource: `${input.from} Wallet`,
        delivery: "Instantaneous",
      },
    }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/wallets");
  revalidatePath("/transactions");
  revalidatePath("/convert");
  return {
    ok: true,
    message: `Converted ${amount} ${input.from} into ${received.toFixed(2)} ${input.to}.`,
  };
}
