/**
 * KYC vocabulary shared by the customer form and the server action.
 * Kept out of the "use server" actions file, which may only export async
 * functions.
 */

export const KYC_BUCKET = "kyc-documents";

/** Document slots, mapped onto the checklist rows opened at sign-up. */
export const DOC_SLOTS = [
  {
    key: "id",
    label: "Government ID",
    hint: "Photo page of your passport, or both sides of your ID card",
    required: true,
  },
  {
    key: "address",
    label: "Proof of Address",
    hint: "Utility bill or bank statement from the last 3 months",
    required: true,
  },
  {
    key: "selfie",
    label: "Biometric Liveness",
    hint: "A clear selfie holding your ID (optional)",
    required: false,
  },
];

export const DOC_SLOT_KEYS = DOC_SLOTS.map((d) => d.key);

export const DOCUMENT_TYPES = [
  "Passport",
  "Driver's licence",
  "National ID card",
  "Residence permit",
];

export const SOURCES_OF_FUNDS = [
  "Employment / salary",
  "Business income",
  "Investments",
  "Savings",
  "Pension",
  "Other",
];

export const KYC_MAX_BYTES = 5 * 1024 * 1024;

export const KYC_ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export const KYC_ACCEPT = ".jpg,.jpeg,.png,.webp,.pdf";
