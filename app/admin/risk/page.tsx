import { Search, ChevronDown, Download, SlidersHorizontal } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/session";
import { formatCurrency } from "@/lib/format";
import RuleToggle from "./rule-toggle";

const filters = ["Severity: All", "Trigger: All", "Status: Open"];

export default async function AdminRiskPage() {
  await requireAdmin();

  const [flaggedRes, rulesRes, usersRes, failedRes, rejectedRes] =
    await Promise.all([
      supabaseAdmin
        .from("risk_flags")
        .select("*")
        .order("score", { ascending: false }),
      supabaseAdmin.from("detection_rules").select("*").order("sort"),
      supabaseAdmin.from("profiles").select("riskScore"),
      supabaseAdmin
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("status", "Failed"),
      supabaseAdmin
        .from("transfers")
        .select("*", { count: "exact", head: true })
        .eq("status", "Rejected"),
    ]);

  const flagged = flaggedRes.data ?? [];
  const rules = rulesRes.data ?? [];
  const users = usersRes.data ?? [];
  const failedTxns = failedRes.count ?? 0;
  const rejectedTransfers = rejectedRes.count ?? 0;

  const openCases = flagged.filter((f) => f.status === "Open").length;
  const flagged24 = flagged.filter((f) => f.critical || f.score > 80).length;
  const scores = users.map((u) => u.riskScore ?? 0).filter((n) => n > 0);
  const avgRisk =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
  const blocked = failedTxns + rejectedTransfers;

  const kpis = [
    { label: "OPEN CASES", value: String(openCases), tone: "text-red-500", sub: "Under investigation" },
    { label: "FLAGGED (24H)", value: String(flagged24), tone: "text-amber-500", sub: "Risk score > 80" },
    { label: "AVG RISK SCORE", value: String(avgRisk), tone: "text-emerald-500", sub: "Network-wide, healthy" },
    { label: "BLOCKED ATTEMPTS", value: String(blocked), tone: "text-slate-900", sub: "Auto-rejected this week" },
  ];

  return (
    <div className="flex h-full flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-extrabold text-slate-900">
            Risk &amp; Fraud Center
          </h1>
          <p className="text-sm text-slate-600">
            Investigate flagged activity, tune detection rules and manage open
            fraud cases.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-900 transition-colors hover:bg-slate-50">
          <Download className="size-3.5 text-slate-500" />
          Export Case Log
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-5"
          >
            <p className="text-[11px] font-bold tracking-[0.5px] text-slate-500">
              {k.label}
            </p>
            <p className={`text-2xl font-extrabold ${k.tone}`}>{k.value}</p>
            <p className="text-[11px] text-slate-600">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <Search className="size-3.5 shrink-0 text-slate-500" />
          <input
            type="text"
            placeholder="Search by account, case ID or trigger..."
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
        {/* Flagged activity table */}
        <div className="flex min-w-0 flex-1 flex-col overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 py-3 text-[11px] font-bold text-slate-500">
            <span className="w-[160px]">ACCOUNT</span>
            <span className="flex-1">TRIGGER</span>
            <span className="w-[70px] text-center">RISK</span>
            <span className="w-[120px] text-right">AMOUNT</span>
            <span className="w-[100px] text-right">TIME</span>
            <span className="w-[100px] text-right">ACTION</span>
          </div>
          <div className="flex flex-col">
            {flagged.length === 0 && (
              <div className="flex flex-col items-center gap-1.5 border-b border-slate-200 px-6 py-14 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  No flagged activity
                </p>
                <p className="max-w-sm text-[13px] text-slate-500">
                  Accounts appear here when live activity trips one of the
                  detection rules below.
                </p>
              </div>
            )}
            {flagged.map((f) => {
              const scoreTone =
                f.score >= 85
                  ? "text-red-500"
                  : f.score >= 70
                    ? "text-amber-500"
                    : "text-emerald-500";
              return (
                <div
                  key={f.id}
                  className={`flex items-center border-b border-slate-200 px-6 py-3.5 ${
                    f.critical ? "bg-red-50" : ""
                  }`}
                >
                  <div className="flex w-[160px] flex-col gap-0.5">
                    <p className="font-mono text-xs font-semibold text-slate-900">
                      {f.account}
                    </p>
                    <p className="text-[11px] text-slate-500">{f.accountSub}</p>
                  </div>
                  <span className="flex-1 text-[13px] text-slate-600">
                    {f.trigger}
                  </span>
                  <span
                    className={`w-[70px] text-center font-mono text-sm font-bold ${scoreTone}`}
                  >
                    {f.score}
                  </span>
                  <span className="w-[120px] text-right font-mono text-[13px] font-semibold text-slate-900">
                    {formatCurrency(f.amount, "USD")}
                  </span>
                  <span className="w-[100px] text-right text-[11px] text-slate-500">
                    {f.when}
                  </span>
                  <div className="flex w-[100px] justify-end">
                    <button className="text-[13px] font-semibold text-blue-500 hover:text-blue-600">
                      Investigate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
            <p className="text-[13px] text-slate-500">
              Showing {flagged.length} of {flagged.length} open cases
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

        {/* Detection rules */}
        <div className="flex w-full shrink-0 flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 xl:w-[360px]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-amber-500" />
            <h2 className="text-[15px] font-bold text-slate-900">
              Detection Rules
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {rules.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[13px] font-semibold text-slate-900">
                    {r.label}
                  </p>
                  <p className="text-[11px] text-slate-500">{r.desc}</p>
                </div>
                <RuleToggle id={r.id} defaultOn={r.enabled} aria-label={r.label} />
              </div>
            ))}
          </div>

          <div className="w-full border-t border-slate-200" />

          {/* Model sensitivity */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                MODEL SENSITIVITY
              </span>
              <span className="text-[13px] font-bold text-amber-500">Balanced</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-[65%] rounded-full bg-amber-500" />
            </div>
            <p className="text-[11px] text-slate-500">
              Higher sensitivity flags more activity but raises false positives.
            </p>
          </div>

          <button className="rounded-lg bg-slate-900 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-slate-800">
            Save Rule Changes
          </button>
        </div>
      </div>
    </div>
  );
}
