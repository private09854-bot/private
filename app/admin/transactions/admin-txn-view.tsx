"use client";

import { useMemo, useState } from "react";
import { Search, ChevronDown, Calendar } from "lucide-react";
import Badge from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";

type Tone = "success" | "warning" | "danger" | "neutral";

export type AdminTxn = {
  id: string;
  ref: string;
  party: string;
  partySub: string;
  route: string;
  currency: string;
  amount: number;
  risk: string;
  status: string;
  flagged: boolean;
};

const riskTone: Record<string, Tone> = {
  Low: "success",
  Medium: "warning",
  High: "danger",
};
const statusTone: Record<string, Tone> = {
  Completed: "success",
  Processing: "warning",
  Pending: "warning",
  Failed: "danger",
  Flagged: "danger",
};

function Dropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[13px] font-semibold text-slate-900 transition-colors hover:bg-slate-50">
      {label}: {value}
      <ChevronDown className="size-2.5 text-slate-500" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label={label}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function AdminTxnView({ rows }: { rows: AdminTxn[] }) {
  const [query, setQuery] = useState("");
  const [currency, setCurrency] = useState("All");
  const [route, setRoute] = useState("All");
  const [risk, setRisk] = useState("All");
  const [status, setStatus] = useState("All");

  const currencies = useMemo(
    () => ["All", ...Array.from(new Set(rows.map((r) => r.currency)))],
    [rows],
  );
  const routes = useMemo(
    () => ["All", ...Array.from(new Set(rows.map((r) => r.route)))],
    [rows],
  );
  const risks = ["All", "Low", "Medium", "High"];
  const statuses = useMemo(
    () => ["All", ...Array.from(new Set(rows.map((r) => r.status)))],
    [rows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (currency !== "All" && r.currency !== currency) return false;
      if (route !== "All" && r.route !== route) return false;
      if (risk !== "All" && r.risk !== risk) return false;
      if (status !== "All" && r.status !== status) return false;
      if (
        q &&
        !r.ref.toLowerCase().includes(q) &&
        !r.party.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [rows, query, currency, route, risk, status]);

  return (
    <>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <Search className="size-3.5 shrink-0 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by transaction ID or counterparty..."
            className="w-full bg-transparent text-[13px] text-slate-900 placeholder:text-slate-500 focus:outline-none"
          />
        </div>
        <Dropdown label="Currency" value={currency} options={currencies} onChange={setCurrency} />
        <Dropdown label="Route" value={route} options={routes} onChange={setRoute} />
        <Dropdown label="Risk" value={risk} options={risks} onChange={setRisk} />
        <Dropdown label="Status" value={status} options={statuses} onChange={setStatus} />
        <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[13px] font-semibold text-slate-900 transition-colors hover:bg-slate-50">
          <Calendar className="size-3.5 text-slate-500" />
          Last 30 Days
        </button>
      </div>

      {/* Table */}
      <div className="flex min-w-0 flex-1 flex-col overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 py-3 text-[11px] font-bold text-slate-500">
          <span className="w-[150px]">TXN ID</span>
          <span className="flex-1">COUNTERPARTY</span>
          <span className="w-[120px]">ROUTE</span>
          <span className="w-[140px] text-right">AMOUNT</span>
          <span className="w-[90px] text-center">RISK</span>
          <span className="w-[110px] text-right">STATUS</span>
        </div>
        <div className="flex flex-col">
          {filtered.map((t) => {
            const displayStatus = t.flagged ? "Flagged" : t.status;
            return (
              <div
                key={t.id}
                className={`flex items-center border-b border-slate-200 px-6 py-3.5 ${
                  t.flagged ? "bg-red-50" : ""
                }`}
              >
                <span className="w-[150px] font-mono text-xs font-semibold text-slate-900">
                  {t.ref}
                </span>
                <div className="flex flex-1 flex-col gap-0.5">
                  <p className="text-[13px] font-semibold text-slate-900">
                    {t.party}
                  </p>
                  <p className="text-[11px] text-slate-500">{t.partySub}</p>
                </div>
                <div className="w-[120px]">
                  <Badge tone="neutral">{t.route}</Badge>
                </div>
                <span
                  className={`w-[140px] text-right font-mono text-[13px] font-semibold ${
                    t.amount > 0 ? "text-emerald-500" : "text-slate-900"
                  }`}
                >
                  {formatCurrency(t.amount, t.currency, { sign: true })}
                </span>
                <div className="flex w-[90px] justify-center">
                  <Badge tone={riskTone[t.risk] ?? "neutral"}>{t.risk}</Badge>
                </div>
                <div className="flex w-[110px] justify-end">
                  <Badge tone={statusTone[displayStatus] ?? "neutral"}>
                    {displayStatus}
                  </Badge>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-6 py-10 text-center text-[13px] text-slate-500">
              No settlements match your filters.
            </div>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
          <p className="text-[13px] text-slate-500">
            Showing {filtered.length} of {rows.length} settlements
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
    </>
  );
}
