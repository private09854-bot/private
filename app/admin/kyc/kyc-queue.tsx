"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import Badge from "@/components/ui/badge";
import { approveKyc, rejectKyc, escalateKyc } from "@/app/actions/admin";

type Tone = "success" | "warning" | "danger" | "neutral";

export type KycDoc = { label: string; state: string; tone: Tone };
export type Applicant = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  flag: string;
  country: string;
  requesting: string;
  docsLabel: string;
  submittedLabel: string;
  riskScore: number;
  riskLabel: string;
  riskTone: Tone;
  status: string;
  escalated: boolean;
  targetTier: string;
  docFile: string;
  documents: KycDoc[];
};

const filters = ["Tier: All", "Document: All", "Region: All"];

const statusBadge: Record<string, { tone: Tone; label: string }> = {
  pending: { tone: "warning", label: "In Progress" },
  escalated: { tone: "danger", label: "Escalated" },
  approved: { tone: "success", label: "Approved" },
  rejected: { tone: "danger", label: "Rejected" },
};

export default function KycQueue({ applicants }: { applicants: Applicant[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(
    applicants.find((a) => a.status === "pending" || a.status === "escalated")
      ?.id ??
      applicants[0]?.id ??
      "",
  );
  const [pending, startTransition] = useTransition();
  const [flash, setFlash] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return applicants;
    return applicants.filter(
      (a) =>
        a.name.toLowerCase().includes(q) || a.handle.toLowerCase().includes(q),
    );
  }, [applicants, query]);

  const selected =
    applicants.find((a) => a.id === selectedId) ?? applicants[0] ?? null;

  function run(fn: () => Promise<unknown>, msg: string) {
    startTransition(async () => {
      await fn();
      setFlash(msg);
      router.refresh();
      setTimeout(() => setFlash(""), 2500);
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-8">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <Search className="size-3.5 shrink-0 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by applicant, account ID or document ref..."
            className="w-full bg-transparent text-[13px] text-slate-900 placeholder:text-slate-500 focus:outline-none"
          />
        </div>
        {filters.map((f) => (
          <button
            key={f}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[13px] font-semibold text-slate-900 transition-colors hover:bg-slate-50"
          >
            {f}
            <ChevronDown className="size-2.5 text-slate-500" />
          </button>
        ))}
      </div>

      {/* Split workspace */}
      <div className="flex flex-1 flex-col gap-6 xl:flex-row xl:items-start">
        {/* Queue table */}
        <div className="flex min-w-0 flex-1 flex-col overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 py-3 text-[11px] font-bold text-slate-500">
            <span className="flex-1">APPLICANT</span>
            <span className="w-[150px]">REQUESTING</span>
            <span className="w-[130px]">DOCUMENTS</span>
            <span className="w-[110px]">SUBMITTED</span>
            <span className="w-[80px]">RISK</span>
            <span className="w-[70px] text-right">ACTION</span>
          </div>
          <div className="flex flex-col">
            {filtered.map((a) => (
              <div
                key={a.id}
                className={`flex items-center border-b border-slate-200 px-6 py-3.5 ${
                  selected?.id === a.id
                    ? "bg-amber-100/25"
                    : a.escalated
                      ? "bg-red-50"
                      : ""
                }`}
              >
                <div className="flex flex-1 items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.avatar}
                    alt={a.name}
                    className="size-9 shrink-0 rounded-full object-cover"
                  />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="truncate text-[13px] font-semibold text-slate-900">
                      {a.flag} {a.name}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">
                      {a.handle}
                    </p>
                  </div>
                </div>
                <span className="w-[150px] text-[13px] font-semibold text-slate-900">
                  {a.requesting}
                </span>
                <span className="w-[130px] text-[13px] text-slate-600">
                  {a.docsLabel}
                </span>
                <span className="w-[110px] text-[13px] text-slate-600">
                  {a.submittedLabel}
                </span>
                <div className="w-[80px]">
                  <Badge tone={a.riskTone}>{a.riskLabel}</Badge>
                </div>
                <div className="flex w-[70px] justify-end">
                  <button
                    onClick={() => setSelectedId(a.id)}
                    className="text-[13px] font-semibold text-blue-500 hover:text-blue-600"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
            <p className="text-[13px] text-slate-500">
              Showing {filtered.length} of {applicants.length} in queue
            </p>
            <div className="flex items-center gap-2">
              <button className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100">
                Previous
              </button>
              <span className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-bold text-white">
                1
              </span>
              <button className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-900 transition-colors hover:bg-slate-50">
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Review panel */}
        {selected && (
          <div className="flex w-full shrink-0 flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 xl:w-[360px]">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-slate-900">
                Active Review
              </h2>
              <Badge tone={statusBadge[selected.status]?.tone ?? "neutral"}>
                {statusBadge[selected.status]?.label ?? selected.status}
              </Badge>
            </div>

            {/* Applicant */}
            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selected.avatar}
                  alt={selected.name}
                  className="size-12 rounded-full object-cover"
                />
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-bold text-slate-900">
                    {selected.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {selected.handle} • {selected.flag} {selected.country}
                  </p>
                </div>
              </div>
              <div className="w-full border-t border-slate-200" />
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Requesting</span>
                <span className="font-semibold text-slate-900">
                  {selected.requesting} upgrade
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Submitted</span>
                <span className="font-mono font-semibold text-slate-900">
                  {selected.submittedLabel}
                </span>
              </div>
            </div>

            {/* Document preview */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-white">
                <FileCheck className="size-5 text-emerald-500" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="truncate text-[13px] font-semibold text-slate-900">
                  {selected.docFile || "Document file not uploaded"}
                </p>
                <p className="text-[11px] text-slate-500">
                  2.4 MB • {selected.submittedLabel}
                </p>
              </div>
              <button className="shrink-0 text-[13px] font-semibold text-blue-500 hover:text-blue-600">
                Open
              </button>
            </div>

            {/* Checklist */}
            <div className="flex flex-col gap-3.5">
              <p className="text-xs font-bold text-slate-500">
                VERIFICATION CHECKLIST
              </p>
              {selected.documents.map((docm) => (
                <div
                  key={docm.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-[13px] text-slate-900">
                    {docm.label}
                  </span>
                  <Badge tone={docm.tone}>{docm.state}</Badge>
                </div>
              ))}
            </div>

            {/* Risk score */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  RISK ASSESSMENT
                </span>
                <span
                  className={`flex items-center gap-1.5 text-[13px] font-bold ${
                    selected.riskTone === "danger"
                      ? "text-red-500"
                      : selected.riskTone === "warning"
                        ? "text-amber-500"
                        : "text-emerald-500"
                  }`}
                >
                  <ShieldCheck className="size-3.5" />
                  {selected.riskScore} / 100 {selected.riskLabel}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full ${
                    selected.riskTone === "danger"
                      ? "bg-red-500"
                      : selected.riskTone === "warning"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                  style={{ width: `${selected.riskScore}%` }}
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
                disabled={pending || selected.status === "approved"}
                onClick={() =>
                  run(
                    () => approveKyc(selected.id),
                    `${selected.name} approved for ${selected.targetTier}.`,
                  )
                }
                className="rounded-lg bg-slate-900 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
              >
                {selected.status === "approved"
                  ? "Approved"
                  : `Approve ${selected.targetTier} Upgrade`}
              </button>
              <div className="flex gap-3">
                <button
                  disabled={pending}
                  onClick={() =>
                    run(
                      () => escalateKyc(selected.id),
                      `${selected.name} escalated to compliance.`,
                    )
                  }
                  className="flex-1 rounded-lg border border-slate-200 py-2.5 text-[13px] font-semibold text-slate-900 transition-colors hover:bg-slate-50 disabled:opacity-60"
                >
                  Escalate
                </button>
                <button
                  disabled={pending || selected.status === "rejected"}
                  onClick={() =>
                    run(
                      () => rejectKyc(selected.id),
                      `${selected.name} rejected.`,
                    )
                  }
                  className="flex-1 rounded-lg border border-red-200 py-2.5 text-[13px] font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
