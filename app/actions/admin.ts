"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
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
  const { data: app } = await supabaseAdmin
    .from("kyc_applications")
    .select("userId,requesting")
    .eq("id", appId)
    .maybeSingle();
  if (!app) return { error: "Application not found." };

  const tier = targetTier(app.requesting as string);

  const { error } = await supabaseAdmin
    .from("kyc_applications")
    .update({
      status: "approved",
      escalated: false,
      reviewedAt: new Date().toISOString(),
      reviewNote: null,
    })
    .eq("id", appId);
  if (error) return { error: error.message };

  // The customer sees each checklist row clear, not just the headline status.
  await supabaseAdmin
    .from("kyc_documents")
    .update({ status: "Verified" })
    .eq("appId", appId);

  await supabaseAdmin
    .from("profiles")
    .update({ kycStatus: "Verified", flagged: false, ...(tier ? { tier } : {}) })
    .eq("id", app.userId as string);

  revalidatePath("/profile");
  revalidatePath("/kyc");

  revalidatePath("/admin/kyc");
  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { ok: true };
}

export async function rejectKyc(
  appId: string,
  reason?: string,
): Promise<AdminResult> {
  await requireAdmin();
  const { data: app } = await supabaseAdmin
    .from("kyc_applications")
    .select("userId")
    .eq("id", appId)
    .maybeSingle();
  if (!app) return { error: "Application not found." };

  const { error } = await supabaseAdmin
    .from("kyc_applications")
    .update({
      status: "rejected",
      escalated: false,
      reviewedAt: new Date().toISOString(),
      reviewNote: reason?.trim() || null,
    })
    .eq("id", appId);
  if (error) return { error: error.message };

  await supabaseAdmin
    .from("kyc_documents")
    .update({ status: "Rejected" })
    .eq("appId", appId);

  await supabaseAdmin
    .from("profiles")
    .update({ kycStatus: "Rejected" })
    .eq("id", app.userId as string);

  revalidatePath("/profile");
  revalidatePath("/kyc");

  revalidatePath("/admin/kyc");
  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { ok: true };
}

export async function escalateKyc(appId: string): Promise<AdminResult> {
  await requireAdmin();
  const { error } = await supabaseAdmin
    .from("kyc_applications")
    .update({ status: "escalated", escalated: true })
    .eq("id", appId);
  if (error) return { error: error.message };

  revalidatePath("/admin/kyc");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Transfers
// ---------------------------------------------------------------------------
export async function authorizeTransfer(id: string): Promise<AdminResult> {
  await requireAdmin();
  const { error } = await supabaseAdmin
    .from("transfers")
    .update({ status: "Authorized" })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/transfers");
  revalidatePath("/admin");
  return { ok: true };
}

export async function rejectTransfer(id: string): Promise<AdminResult> {
  await requireAdmin();
  const { error } = await supabaseAdmin
    .from("transfers")
    .update({ status: "Rejected" })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/transfers");
  revalidatePath("/admin");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Risk detection rules
// ---------------------------------------------------------------------------
export async function toggleDetectionRule(id: string): Promise<AdminResult> {
  await requireAdmin();
  const { data: rule } = await supabaseAdmin
    .from("detection_rules")
    .select("enabled")
    .eq("id", id)
    .maybeSingle();
  if (!rule) return { error: "Rule not found." };

  const { error } = await supabaseAdmin
    .from("detection_rules")
    .update({ enabled: !rule.enabled })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/risk");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Admin-only: transfer treasury funds to ANY customer (atomic, double-entry)
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

  const { error } = await supabaseAdmin.rpc("admin_send", {
    p_admin: admin.id,
    p_target: input.targetUserId,
    p_amount: amount,
    p_currency: input.currency,
    p_note: input.note ?? null,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/send");
  revalidatePath("/admin");
  revalidatePath("/admin/transactions");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// User status (freeze / unfreeze)
// ---------------------------------------------------------------------------
export async function setUserFrozen(
  userId: string,
  frozen: boolean,
): Promise<AdminResult> {
  await requireAdmin();
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ kycStatus: frozen ? "Frozen" : "Verified", flagged: frozen })
    .eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return { ok: true };
}
