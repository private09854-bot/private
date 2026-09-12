"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireCustomer, requireAdmin } from "@/lib/session";
import { countryByCode } from "@/lib/countries";
import {
  KYC_BUCKET,
  DOC_SLOTS,
  DOC_SLOT_KEYS,
  DOCUMENT_TYPES,
  SOURCES_OF_FUNDS,
  KYC_MAX_BYTES,
  KYC_ALLOWED_MIME,
} from "@/lib/kyc-options";

export type KycState = { ok?: boolean; error?: string };

/**
 * Mint a short-lived signed upload URL for one document slot. The browser PUTs
 * the file straight to Supabase Storage with it, so the file never passes
 * through the server action.
 */
export async function createKycUploadTarget(
  slot: string,
  fileName: string,
  mimeType: string,
  fileSize: number,
): Promise<{ path?: string; token?: string; error?: string }> {
  const user = await requireCustomer();

  if (!DOC_SLOT_KEYS.includes(slot)) {
    return { error: "Unknown document type." };
  }
  if (!KYC_ALLOWED_MIME.includes(mimeType)) {
    return { error: "Upload a JPG, PNG, WEBP or PDF." };
  }
  if (fileSize > KYC_MAX_BYTES) {
    return { error: "Each file must be 5 MB or smaller." };
  }

  const ext = (fileName.split(".").pop() ?? "bin")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 5);
  // Path is namespaced by user so one customer's objects can never collide
  // with another's. The bucket is private; reads need a signed URL.
  const path = `${user.id}/${slot}.${ext}`;

  const { data, error } = await supabaseAdmin.storage
    .from(KYC_BUCKET)
    .createSignedUploadUrl(path, { upsert: true });

  if (error) return { error: error.message };
  return { path: data.path, token: data.token };
}

/**
 * Record the submission and hand it to the admin queue.
 * `uploaded` maps a slot key to the storage path the browser just wrote.
 */
export async function submitKyc(
  form: {
    documentType: string;
    documentNumber: string;
    issuingCountry: string;
    documentExpiry: string;
    occupation: string;
    sourceOfFunds: string;
  },
  uploaded: Record<string, { path: string; fileName: string; mimeType: string; fileSize: number }>,
): Promise<KycState> {
  const user = await requireCustomer();

  // --- validate -----------------------------------------------------------
  if (!DOCUMENT_TYPES.includes(form.documentType)) {
    return { error: "Choose the type of ID you are submitting." };
  }
  const docNumber = form.documentNumber.trim();
  if (docNumber.length < 4 || docNumber.length > 40) {
    return { error: "Enter the document number as it appears on your ID." };
  }
  if (!countryByCode(form.issuingCountry)) {
    return { error: "Choose the country that issued the document." };
  }
  if (!form.documentExpiry) {
    return { error: "Enter the document expiry date." };
  }
  const expiry = new Date(`${form.documentExpiry}T00:00:00Z`);
  if (Number.isNaN(expiry.getTime())) {
    return { error: "Enter a valid expiry date." };
  }
  if (expiry.getTime() < Date.now()) {
    return { error: "That document has expired. Submit one that is still valid." };
  }
  if (!form.occupation.trim()) return { error: "Enter your occupation." };
  if (!SOURCES_OF_FUNDS.includes(form.sourceOfFunds)) {
    return { error: "Choose your main source of funds." };
  }

  for (const slot of DOC_SLOTS) {
    if (slot.required && !uploaded[slot.key]) {
      return { error: `Upload your ${slot.label.toLowerCase()}.` };
    }
  }

  // --- find (or open) the application -------------------------------------
  let { data: app } = await supabaseAdmin
    .from("kyc_applications")
    .select("id,status")
    .eq("userId", user.id)
    .maybeSingle();

  if (app && (app.status === "pending" || app.status === "escalated")) {
    return { error: "Your documents are already under review." };
  }
  if (app && app.status === "approved") {
    return { error: "Your identity is already verified." };
  }

  if (!app) {
    const { data: created, error } = await supabaseAdmin
      .from("kyc_applications")
      .insert({
        userId: user.id,
        requesting: "Tier 1 → 2",
        docs: "0 documents",
        submitted: "Just now",
        risk: 0,
        riskTone: "text-emerald-500",
        status: "draft",
        escalated: false,
      })
      .select("id,status")
      .single();
    if (error || !created) {
      return { error: error?.message ?? "Could not open an application." };
    }
    app = created;
  }

  const count = Object.keys(uploaded).length;

  const { error: upErr } = await supabaseAdmin
    .from("kyc_applications")
    .update({
      documentType: form.documentType,
      documentNumber: docNumber,
      issuingCountry: form.issuingCountry,
      documentExpiry: form.documentExpiry,
      occupation: form.occupation.trim(),
      sourceOfFunds: form.sourceOfFunds,
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewNote: null,
      status: "pending",
      escalated: false,
      docs: `${count} document${count === 1 ? "" : "s"}`,
      submitted: "Just now",
    })
    .eq("id", app.id);
  if (upErr) return { error: upErr.message };

  // --- attach the files to their checklist rows ---------------------------
  for (const slot of DOC_SLOTS) {
    const file = uploaded[slot.key];
    if (!file) continue;
    const patch = {
      storagePath: file.path,
      fileName: file.fileName,
      mimeType: file.mimeType,
      fileSize: file.fileSize,
      uploadedAt: new Date().toISOString(),
      status: "Submitted",
    };
    const { data: existing } = await supabaseAdmin
      .from("kyc_documents")
      .select("id")
      .eq("appId", app.id)
      .eq("label", slot.label)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin
        .from("kyc_documents")
        .update(patch)
        .eq("id", existing.id);
    } else {
      await supabaseAdmin
        .from("kyc_documents")
        .insert({ appId: app.id, label: slot.label, sort: 0, ...patch });
    }
  }

  await supabaseAdmin
    .from("profiles")
    .update({ kycStatus: "Pending" })
    .eq("id", user.id);

  revalidatePath("/profile");
  revalidatePath("/kyc");
  revalidatePath("/admin/kyc");
  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { ok: true };
}

/**
 * Short-lived signed URL so an admin can open a submitted document.
 * Admin-only: the bucket is private and has no public policy.
 */
export async function getKycDocumentUrl(
  documentId: string,
): Promise<{ url?: string; error?: string }> {
  await requireAdmin();

  const { data: doc } = await supabaseAdmin
    .from("kyc_documents")
    .select("storagePath")
    .eq("id", documentId)
    .maybeSingle();

  if (!doc?.storagePath) return { error: "No file attached to this item." };

  const { data, error } = await supabaseAdmin.storage
    .from(KYC_BUCKET)
    .createSignedUrl(doc.storagePath as string, 300); // 5 minutes

  if (error) return { error: error.message };
  return { url: data.signedUrl };
}
