-- Makes KYC a real submit -> review -> approve loop.
--
-- Run this ONCE in the Supabase SQL Editor (Dashboard -> SQL Editor -> New
-- query -> paste -> Run). Safe to re-run: every statement uses "if not exists".

-- ---------------------------------------------------------------------------
-- What the customer submits
-- ---------------------------------------------------------------------------
alter table public.kyc_applications
  add column if not exists "documentType"    text,   -- Passport | Driver's licence | National ID
  add column if not exists "documentNumber"  text,
  add column if not exists "issuingCountry"  text,   -- ISO 3166-1 alpha-2
  add column if not exists "documentExpiry"  date,
  add column if not exists occupation        text,
  add column if not exists "sourceOfFunds"   text,
  add column if not exists "submittedAt"     timestamptz,
  add column if not exists "reviewedAt"      timestamptz,
  add column if not exists "reviewNote"      text;

-- Uploaded files live in the private `kyc-documents` storage bucket; the row
-- holds the object path so the admin can mint a short-lived signed URL.
alter table public.kyc_documents
  add column if not exists "storagePath" text,
  add column if not exists "fileName"    text,
  add column if not exists "mimeType"    text,
  add column if not exists "fileSize"    bigint,
  add column if not exists "uploadedAt"  timestamptz;

create index if not exists kyc_applications_status_idx
  on public.kyc_applications (status);

-- ---------------------------------------------------------------------------
-- Status vocabulary
-- ---------------------------------------------------------------------------
-- draft      - opened at sign-up, customer has not submitted anything yet
-- pending    - submitted, waiting on an admin decision
-- escalated  - flagged for compliance review
-- approved   - admin approved; profile.kycStatus becomes 'Verified'
-- rejected   - admin declined; profile.kycStatus becomes 'Rejected'
--
-- Applications created before this migration were auto-opened as 'pending'
-- with nothing attached. Move those that have no submission back to 'draft' so
-- the admin queue only ever shows genuine submissions.
update public.kyc_applications
   set status = 'draft'
 where status = 'pending'
   and "submittedAt" is null;

comment on column public.kyc_applications.status is
  'draft | pending | escalated | approved | rejected';
comment on column public.kyc_documents."storagePath" is
  'Object path inside the private kyc-documents bucket.';
