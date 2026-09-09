"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, AlertTriangle, CheckCircle2 } from "lucide-react";
import Badge from "@/components/ui/badge";
import { authorizeTransfer, rejectTransfer } from "@/app/actions/admin";
import { formatCurrency } from "@/lib/format";

type Tone = "success" | "warning" | "danger" | "neutral";

export type TransferRow = {
  id: string;
  ref: string;
  party: string;
  partySub: string;
  route: string;
  amount: number;
  submitted: string;
  risk: string;
  status: string;
};

const filters = ["Route: All", "Priority: All", "Amount: All"];

const priorityTone: Record<string, Tone> = {
  High: "danger",
  Medium: "warning",
  Low: "neutral",
};
const riskScore: Record<string, number> = { High: 84, Medium: 60, Low: 30 };
const statusTone: Record<string, Tone> = {
  Pending: "warning",
  Authorized: "success",
  Rejected: "danger",
};

export default function TransfersQueue({
  transfers,
}: {
  transfers: TransferRow[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(
    transfers.find((t) => t.status === "Pending")?.id ?? transfers[0]?.id ?? "",
  );
  const [pending, startTransition] = useTransition();
  const [flash, setFlash] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return transfers;
    return transfers.filter(
      (t) =>
        t.ref.toLowerCase().includes(q) ||
        t.party.toLowerCase().includes(q),
    );
  }, [transfers, query]);

  const selected =
    transfers.find((t) => t.id === selectedId) ?? transfers[0] ?? null;
  const score = selected ? riskScore[selected.risk] ?? 40 : 0;

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
            placeholder="Search by reference or recipient..."
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
            <span className="w-[130px]">REFERENCE</span>
            <span className="flex-1">RECIPIENT</span>
            <span className="w-[110px]">ROUTE</span>
            <span className="w-[130px] text-right">AMOUNT</span>
            <span className="w-[100px] text-right">REQUESTED</span>
            <span className="w-[90px] text-center">PRIORITY</span>
            <span className="w-[80px] text-right">ACTION</span>
          </div>
          <div className="flex flex-col">
            {filtered.map((t) => (
              <div
                key={t.id}
                className={`flex items-center border-b border-slate-200 px-6 py-3.5 ${
                  selected?.id === t.id
                    ? "bg-amber-100/25"
                    : t.risk === "High" && t.status === "Pending"
                      ? "bg-red-50"
                      : ""
                }`}
              >
                <span className="w-[130px] font-mono text-xs font-semibold text-slate-900">
                  {t.ref}
                </span>
                <div className="flex flex-1 flex-col gap-0.5">
                  <p className="text-[13px] font-semibold text-slate-900">
                    {t.party}
                  </p>
                  <p className="text-[11px] text-slate-500">{t.partySub}</p>
                </div>
                <span className="w-[110px] text-[13px] text-slate-600">
                  {t.route}
                </span>
                <span className="w-[130px] text-right font-mono text-[13px] font-semibold text-slate-900">
                  -{formatCurrency(t.amount, "USD")}
                </span>
                <span className="w-[100px] text-right text-[11px] text-slate-500">
                  {t.submitted}
                </span>
                <div className="flex w-[90px] justify-center">
                  {t.status === "Pending" ? (
                    <Badge tone={priorityTone[t.risk] ?? "neutral"}>
                      {t.risk}
                    </Badge>
                  ) : (
                    <Badge tone={statusTone[t.status] ?? "neutral"}>
                      {t.status}
                    </Badge>
                  )}
                </div>
                <div className="flex w-[80px] justify-end">
                  <button
                    onClick={() => setSelectedId(t.id)}
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
              Showing {filtered.length} of {transfers.length} pending
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

        {/* Authorization detail */}
        {selected && (
          <div className="flex w-full shrink-0 flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 xl:w-[360px]">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-slate-900">
                Authorization Detail
              </h2>
              <Badge tone={statusTone[selected.status] ?? "neutral"}>
                {selected.status}
              </Badge>
            </div>

            {/* Recipient + amount */}
            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.5px] text-slate-500">
                {selected.party}
              </p>
              <p className="font-mono text-2xl font-extrabold text-slate-900">
                -{formatCurrency(selected.amount, "USD")}
              </p>
              <div className="w-full border-t border-slate-200" />
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Reference</span>
                <span className="font-mono font-semibold text-slate-900">
                  {selected.ref}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Route</span>
                <span className="font-semibold text-slate-900">
                  {selected.route}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Originating</span>
                <span className="font-semibold text-slate-900">USD Vault</span>
              </div>
            </div>

            {/* Risk */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  RISK ASSESSMENT
                </span>
                <span
                  className={`flex items-center gap-1.5 text-[13px] font-bold ${
                    score >= 80
                      ? "text-red-500"
                      : score >= 50
                        ? "text-amber-500"
                        : "text-emerald-500"
                  }`}
                >
                  <AlertTriangle className="size-3.5" />
                  {score} / 100 {selected.risk}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full ${
                    score >= 80
                      ? "bg-red-500"
                      : score >= 50
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Automated screening result for this instruction.
              </p>
            </div>

            {/* Dual authorization */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold text-slate-500">
                DUAL AUTHORIZATION
              </p>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5">
                <span className="text-[13px] text-slate-900">
                  Approver 1 · S. Jenkins
                </span>
                <Badge tone="success">Signed</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5">
                <span className="text-[13px] text-slate-900">
                  Approver 2 · You
                </span>
                <Badge
                  tone={selected.status === "Authorized" ? "success" : "warning"}
                >
                  {selected.status === "Authorized" ? "Signed" : "Pending"}
                </Badge>
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
                disabled={pending || selected.status === "Authorized"}
                onClick={() =>
                  run(
                    () => authorizeTransfer(selected.id),
                    `${selected.ref} authorized.`,
                  )
                }
                className="rounded-lg bg-slate-900 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
              >
                {selected.status === "Authorized"
                  ? "Authorized"
                  : "Authorize Transfer"}
              </button>
              <div className="flex gap-3">
                <button className="flex-1 rounded-lg border border-slate-200 py-2.5 text-[13px] font-semibold text-slate-900 transition-colors hover:bg-slate-50">
                  Hold
                </button>
                <button
                  disabled={pending || selected.status === "Rejected"}
                  onClick={() =>
                    run(
                      () => rejectTransfer(selected.id),
                      `${selected.ref} rejected.`,
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
