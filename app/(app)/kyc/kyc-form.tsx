"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, Check, X, Loader2, FileText, ShieldCheck } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { createKycUploadTarget, submitKyc } from "@/app/actions/kyc";
import { COUNTRIES } from "@/lib/countries";
import {
  KYC_BUCKET,
  DOC_SLOTS,
  DOCUMENT_TYPES,
  SOURCES_OF_FUNDS,
  KYC_MAX_BYTES,
  KYC_ALLOWED_MIME,
  KYC_ACCEPT,
} from "@/lib/kyc-options";

const FIELD =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";
const LABEL = "text-[13px] font-semibold text-slate-900";

type Uploaded = {
  path: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
};

function prettySize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.round(bytes / 1024)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function KycForm({
  defaultCountry,
  accountName,
}: {
  defaultCountry: string;
  accountName: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [documentType, setDocumentType] = useState(DOCUMENT_TYPES[0]);
  const [documentNumber, setDocumentNumber] = useState("");
  const [issuingCountry, setIssuingCountry] = useState(defaultCountry);
  const [documentExpiry, setDocumentExpiry] = useState("");
  const [occupation, setOccupation] = useState("");
  const [sourceOfFunds, setSourceOfFunds] = useState(SOURCES_OF_FUNDS[0]);

  const [uploaded, setUploaded] = useState<Record<string, Uploaded>>({});
  const [busySlot, setBusySlot] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function onPick(slot: string, file: File | undefined) {
    if (!file) return;
    setError("");

    if (!KYC_ALLOWED_MIME.includes(file.type)) {
      setError("Upload a JPG, PNG, WEBP or PDF.");
      return;
    }
    if (file.size > KYC_MAX_BYTES) {
      setError(`"${file.name}" is larger than 5 MB.`);
      return;
    }

    setBusySlot(slot);
    try {
      // Server mints a one-time signed target; the file then goes straight to
      // storage, never through the serverless function.
      const target = await createKycUploadTarget(
        slot,
        file.name,
        file.type,
        file.size,
      );
      if (target.error || !target.path || !target.token) {
        setError(target.error ?? "Could not start the upload.");
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const { error: upErr } = await supabase.storage
        .from(KYC_BUCKET)
        .uploadToSignedUrl(target.path, target.token, file);

      if (upErr) {
        setError(upErr.message);
        return;
      }

      setUploaded((prev) => ({
        ...prev,
        [slot]: {
          path: target.path!,
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
        },
      }));
    } finally {
      setBusySlot(null);
    }
  }

  function onSubmit() {
    setError("");
    startTransition(async () => {
      const res = await submitKyc(
        {
          documentType,
          documentNumber,
          issuingCountry,
          documentExpiry,
          occupation,
          sourceOfFunds,
        },
        uploaded,
      );
      if (res.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  const missingRequired = DOC_SLOTS.filter(
    (s) => s.required && !uploaded[s.key],
  );

  return (
    <div className="flex flex-col gap-8">
      {/* ------------------------------------------------------- document */}
      <section className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-bold text-slate-900">
            Identity document
          </h2>
          <p className="text-[13px] text-slate-500">
            Details must match the document exactly, and the name on it must
            match <span className="font-semibold">{accountName}</span>.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <label htmlFor="documentType" className={LABEL}>
              Document type
            </label>
            <select
              id="documentType"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className={FIELD}
            >
              {DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <label htmlFor="documentNumber" className={LABEL}>
              Document number
            </label>
            <input
              id="documentNumber"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="e.g. P1234567"
              className={FIELD}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <label htmlFor="issuingCountry" className={LABEL}>
              Issuing country
            </label>
            <select
              id="issuingCountry"
              value={issuingCountry}
              onChange={(e) => setIssuingCountry(e.target.value)}
              className={FIELD}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag}  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <label htmlFor="documentExpiry" className={LABEL}>
              Expiry date
            </label>
            <input
              id="documentExpiry"
              type="date"
              value={documentExpiry}
              onChange={(e) => setDocumentExpiry(e.target.value)}
              className={FIELD}
            />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- about */}
      <section className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-bold text-slate-900">About you</h2>
          <p className="text-[13px] text-slate-500">
            Required for anti-money-laundering checks.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <label htmlFor="occupation" className={LABEL}>
              Occupation
            </label>
            <input
              id="occupation"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder="e.g. Software engineer"
              className={FIELD}
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <label htmlFor="sourceOfFunds" className={LABEL}>
              Main source of funds
            </label>
            <select
              id="sourceOfFunds"
              value={sourceOfFunds}
              onChange={(e) => setSourceOfFunds(e.target.value)}
              className={FIELD}
            >
              {SOURCES_OF_FUNDS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- uploads */}
      <section className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-bold text-slate-900">Upload documents</h2>
          <p className="text-[13px] text-slate-500">
            JPG, PNG, WEBP or PDF — up to 5 MB each.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {DOC_SLOTS.map((slot) => {
            const done = uploaded[slot.key];
            const busy = busySlot === slot.key;
            return (
              <div
                key={slot.key}
                className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                  done
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${
                      done
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-slate-400 ring-1 ring-slate-200"
                    }`}
                  >
                    {done ? (
                      <Check className="size-4" />
                    ) : (
                      <FileText className="size-4" />
                    )}
                  </span>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="text-[13px] font-bold text-slate-900">
                      {slot.label}
                      {!slot.required && (
                        <span className="ml-1.5 font-normal text-slate-400">
                          (optional)
                        </span>
                      )}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">
                      {done
                        ? `${done.fileName} · ${prettySize(done.fileSize)}`
                        : slot.hint}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {done && (
                    <button
                      type="button"
                      aria-label={`Remove ${slot.label}`}
                      onClick={() =>
                        setUploaded((p) => {
                          const n = { ...p };
                          delete n[slot.key];
                          return n;
                        })
                      }
                      className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-colors hover:text-slate-900"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                  <label
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-[13px] font-semibold transition-colors ${
                      busy
                        ? "border-slate-200 bg-white text-slate-400"
                        : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {busy ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Upload className="size-3.5" />
                    )}
                    {busy ? "Uploading…" : done ? "Replace" : "Choose file"}
                    <input
                      type="file"
                      accept={KYC_ACCEPT}
                      disabled={busy || pending}
                      onChange={(e) => {
                        onPick(slot.key, e.target.files?.[0]);
                        e.target.value = "";
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {error && (
        <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-[13px] font-semibold text-red-600">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={pending || busySlot !== null || missingRequired.length > 0}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <ShieldCheck className="size-4" />
              Submit for review
            </>
          )}
        </button>
        {missingRequired.length > 0 && (
          <p className="text-center text-[11px] text-slate-500">
            Still needed: {missingRequired.map((s) => s.label).join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}
