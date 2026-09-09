"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export type AdminResult = { ok?: boolean; error?: string };

function targetTier(requesting: string): string | null {
  // "Tier 2 → 3" -> "Tier 3"
  const matches = requesting.match(/\d+/g);
  if (!matches || matches.length === 0) return null;
  return `Tier ${matches[matches.length - 1]}`;
}

// ---------------------------------------------------------------------------
// KYC decisions
// ---------------------------------------------------------------------------
export async function approveKyc(appId: string): Promise<AdminResult> {
  await requireAdmin();
  const app = await prisma.kycApplication.findUnique({ where: { id: appId } });
  if (!app) return { error: "Application not found." };

  const tier = targetTier(app.requesting);
  await prisma.$transaction([
    prisma.kycApplication.update({
      where: { id: appId },
      data: { status: "approved", escalated: false },
    }),
    prisma.user.update({
      where: { id: app.userId },
      data: {
        kycStatus: "Verified",
        flagged: false,
        ...(tier ? { tier } : {}),
      },
    }),
  ]);

  revalidatePath("/admin/kyc");
  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { ok: true };
}

export async function rejectKyc(appId: string): Promise<AdminResult> {
  await requireAdmin();
  const app = await prisma.kycApplication.findUnique({ where: { id: appId } });
  if (!app) return { error: "Application not found." };

  await prisma.$transaction([
    prisma.kycApplication.update({
      where: { id: appId },
      data: { status: "rejected", escalated: false },
    }),
    prisma.user.update({
      where: { id: app.userId },
      data: { kycStatus: "Rejected" },
    }),
  ]);

  revalidatePath("/admin/kyc");
  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { ok: true };
}

export async function escalateKyc(appId: string): Promise<AdminResult> {
  await requireAdmin();
  await prisma.kycApplication.update({
    where: { id: appId },
    data: { status: "escalated", escalated: true },
  });
  revalidatePath("/admin/kyc");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Transfers
// ---------------------------------------------------------------------------
export async function authorizeTransfer(id: string): Promise<AdminResult> {
  await requireAdmin();
  await prisma.transfer.update({
    where: { id },
    data: { status: "Authorized" },
  });
  revalidatePath("/admin/transfers");
  revalidatePath("/admin");
  return { ok: true };
}

export async function rejectTransfer(id: string): Promise<AdminResult> {
  await requireAdmin();
  await prisma.transfer.update({ where: { id }, data: { status: "Rejected" } });
  revalidatePath("/admin/transfers");
  revalidatePath("/admin");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Risk detection rules
// ---------------------------------------------------------------------------
export async function toggleDetectionRule(id: string): Promise<AdminResult> {
  await requireAdmin();
  const rule = await prisma.detectionRule.findUnique({ where: { id } });
  if (!rule) return { error: "Rule not found." };
  await prisma.detectionRule.update({
    where: { id },
    data: { enabled: !rule.enabled },
  });
  revalidatePath("/admin/risk");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Admin-only: transfer treasury funds to ANY customer
// ---------------------------------------------------------------------------
export async function adminSendToUser(input: {
  targetUserId: string;
  amount: number;
  currency: string;
  note?: string;
}): Promise<AdminResult> {
  const admin = await requireAdmin();
  const amount = Number(input.amount);

  if (!input.targetUserId) return { error: "Choose a recipient user." };
  if (!Number.isFinite(amount) || amount <= 0)
    return { error: "Enter an amount greater than zero." };

  const target = await prisma.user.findUnique({
    where: { id: input.targetUserId },
  });
  if (!target) return { error: "That user could not be found." };
  if (target.id === admin.id)
    return { error: "Pick a different account to send to." };

  const adminWallet = await prisma.wallet.findFirst({
    where: { ownerId: admin.id, currency: input.currency },
  });
  if (!adminWallet)
    return { error: `Treasury has no ${input.currency} wallet.` };
  if (adminWallet.balance < amount)
    return { error: `Insufficient ${input.currency} treasury balance.` };

  const symbol = adminWallet.symbol;
  const count = await prisma.transaction.count();
  const refOut = `TXN-2026-${String(847 + count).padStart(5, "0")}`;
  const refIn = `TXN-2026-${String(848 + count).padStart(5, "0")}`;

  await prisma.$transaction(async (tx) => {
    // Debit treasury
    await tx.wallet.update({
      where: { id: adminWallet.id },
      data: {
        balance: { decrement: amount },
        available:
          adminWallet.available != null ? { decrement: amount } : undefined,
      },
    });

    // Credit target — create the wallet if the user doesn't hold that currency
    const targetWallet = await tx.wallet.findFirst({
      where: { ownerId: target.id, currency: input.currency },
    });
    if (targetWallet) {
      await tx.wallet.update({
        where: { id: targetWallet.id },
        data: {
          balance: { increment: amount },
          available:
            targetWallet.available != null ? { increment: amount } : undefined,
        },
      });
    } else {
      await tx.wallet.create({
        data: {
          ownerId: target.id,
          currency: input.currency,
          symbol,
          balance: amount,
          available: amount,
          pending: 0,
          changeLabel: "+0.00%",
          changeTone: "flat",
          sort: 9,
        },
      });
    }

    // Admin-side ledger entry (outgoing)
    await tx.transaction.create({
      data: {
        ref: refOut,
        ownerId: admin.id,
        date: new Date(),
        kind: "send",
        title: target.name,
        sub: target.handle ?? target.email,
        currency: input.currency,
        amount: -amount,
        fee: 0,
        status: "Completed",
        party: target.name,
        partySub: "Platform disbursement",
        route: "Internal",
        risk: "Low",
        reference: input.note?.trim() || undefined,
        walletSource: `Treasury ${input.currency}`,
        delivery: "Instantaneous",
      },
    });

    // Target-side ledger entry (incoming)
    await tx.transaction.create({
      data: {
        ref: refIn,
        ownerId: target.id,
        date: new Date(),
        kind: "receive",
        title: "Vault Platform",
        sub: "Funds received from Vault",
        currency: input.currency,
        amount: amount,
        fee: 0,
        status: "Completed",
        party: "Vault Platform",
        partySub: "Admin disbursement",
        route: "Internal",
        risk: "Low",
        reference: input.note?.trim() || undefined,
        walletSource: `${input.currency} Wallet`,
        delivery: "Instantaneous",
      },
    });
  });

  revalidatePath("/admin/send");
  revalidatePath("/admin");
  revalidatePath("/admin/transactions");
  return {
    ok: true,
    error: undefined,
  };
}

// ---------------------------------------------------------------------------
// User status (freeze / unfreeze)
// ---------------------------------------------------------------------------
export async function setUserFrozen(
  userId: string,
  frozen: boolean,
): Promise<AdminResult> {
  await requireAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { kycStatus: frozen ? "Frozen" : "Verified", flagged: frozen },
  });
  revalidatePath("/admin/users");
  return { ok: true };
}
