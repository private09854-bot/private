"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import Badge from "@/components/ui/badge";
import { approveKyc, rejectKyc } from "@/app/actions/admin";

type Tone = "success" | "warning" | "danger" | "neutral";

export type ReviewApplicant = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  flag: string;
  requesting: string;
  submitted: string;
  targetTier: string;
  riskScore: number;
  riskLabel: string;
  riskTone: Tone;
  documents: { label: string; state: string; tone: Tone }[];
  /** Details captured at sign-up. Null for accounts created before they were collected. */
  details: { label: string; value: string }[];
} | null;

export default function KycReviewCard({
  applicant,
  queued,
}: {
  applicant: ReviewApplicant;
  queued: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [flash, setFlash] = useState("");

  if (!applicant) {
    return (
      <div className="flex w-full shrink-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 xl:w-[360px]">
        <h2 className="text-[15px] font-bold text-slate-900">
          KYC Review Queue
        </h2>
        <p className="text-[13px] text-slate-500">
          No applications are awaiting review.
        </p>
      </div>
    );
  }

  function run(fn: () => Promise<unknown>, msg: string) {
    startTransition(async () => {
      await fn();
      setFlash(msg);
      router.refresh();
      setTimeout(() => setFlash(""), 2500);
    });
  }

  const barColor =
    applicant.riskTone === "danger"
      ? "bg-red-500"
      : applicant.riskTone === "warning"
        ? "bg-amber-500"
        : "bg-emerald-500";
  const textColor =
    applicant.riskTone === "danger"
      ? "text-red-500"
      : applicant.riskTone === "warning"
        ? "text-amber-500"
        : "text-emerald-500";

  return (
    <div className="flex w-full shrink-0 flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 xl:w-[360px]">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-slate-900">
          KYC Review Queue
        </h2>
        <Badge tone="neutral">{queued} queued</Badge>
      </div>

      {/* Applicant */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={applicant.avatar}
            alt={applicant.name}
            className="size-12 rounded-full object-cover"
          />
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-bold text-slate-900">{applicant.name}</p>
            <p className="text-[11px] text-slate-500">
              {applicant.handle} • {applicant.flag}
            </p>
          </div>
        </div>
        <div className="w-full border-t border-slate-200" />
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500">Requesting</span>
          <span className="font-semibold text-slate-900">
            {applicant.requesting} upgrade
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500">Applied</span>
          <span className="font-mono font-semibold text-slate-900">
            {applicant.submitted}
          </span>
        </div>
      </div>

      {/* Details given at sign-up */}
      {applicant.details.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <p className="text-xs font-bold text-slate-500">REGISTERED DETAILS</p>
          {applicant.details.map((d) => (
            <div key={d.label} className="flex items-start justify-between gap-3">
              <span className="shrink-0 text-[11px] text-slate-500">
                {d.label}
              </span>
              <span className="min-w-0 break-words text-right text-[11px] font-semibold text-slate-900">
                {d.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Checklist */}
      <div className="flex flex-col gap-3.5">
        <p className="text-xs font-bold text-slate-500">
          VERIFICATION CHECKLIST
        </p>
        {applicant.documents.map((c) => (
          <div key={c.label} className="flex items-center justify-between">
            <span className="text-[13px] text-slate-900">{c.label}</span>
            <Badge tone={c.tone}>{c.state}</Badge>
          </div>
        ))}
      </div>

      {/* Risk score */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">
            RISK ASSESSMENT
          </span>
          <span className={`flex items-center gap-1.5 text-[13px] font-bold ${textColor}`}>
            <ShieldCheck className="size-3.5" />
            {applicant.riskScore} / 100 {applicant.riskLabel}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full ${barColor}`}
            style={{ width: `${applicant.riskScore}%` }}
          />
        </div>
      </div>

      <div className="w-full border-t border-slate-200" />

      {flash && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-[13px] font-semibold text-emerald-600">
          <CheckCircle2 className="size-4" />
          {flash}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          disabled={pending}
          onClick={() =>
            run(
              () => approveKyc(applicant.id),
              `${applicant.name} approved.`,
            )
          }
          className="rounded-lg bg-slate-900 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
        >
          Approve {applicant.targetTier} Upgrade
        </button>
        <div className="flex gap-3">
          <button className="flex-1 rounded-lg border border-slate-200 py-2.5 text-[13px] font-semibold text-slate-900 transition-colors hover:bg-slate-50">
            Request Info
          </button>
          <button
            disabled={pending}
            onClick={() =>
              run(() => rejectKyc(applicant.id), `${applicant.name} rejected.`)
            }
            className="flex-1 rounded-lg border border-red-200 py-2.5 text-[13px] font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-60"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
