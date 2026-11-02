"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Send,
  Landmark,
  Search,
  ChevronDown,
  Calendar,
  X,
  Download,
  type LucideIcon,
} from "lucide-react";
import Badge from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { I18nText } from "@/components/i18n-text";
import { translationAttribute } from "@/lib/i18n/keys";

export type TxRow = {
  id: string;
  ref: string;
  dateLabel: string;
  timeLabel: string;
  kind: string;
  title: string;
  sub: string;
  currency: string;
  amount: number;
  fee: number;
  status: string;
  party: string | null;
  walletSource: string | null;
  delivery: string | null;
  reference: string | null;
};

const statusTone: Record<string, "success" | "warning" | "danger"> = {
  Completed: "success",
  Processing: "warning",
  Pending: "warning",
  Failed: "danger",
};

const kindIcon: Record<string, LucideIcon> = {
  send: ArrowUpRight,
  receive: ArrowDownLeft,
  convert: ArrowLeftRight,
  wire: Send,
  ach: Landmark,
};

const kindLabel: Record<string, string> = {
  send: "Send",
  receive: "Receive",
  convert: "Convert",
  wire: "Wire",
  ach: "ACH",
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
      <I18nText source={label} /><I18nText i18nKey="ui.hhsact" source=":" />{value === "All" ? <I18nText source="All" /> : value}
      <ChevronDown className="size-2.5 text-slate-500" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label={label}
        {...translationAttribute("aria-label", label)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o === "All" ? <I18nText source="All" /> : o}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function TransactionsView({ rows }: { rows: TxRow[] }) {
  const [query, setQuery] = useState("");
  const [currency, setCurrency] = useState("All");
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("All");
  const [selectedId, setSelectedId] = useState(rows[0]?.id ?? "");

  const currencies = useMemo(
    () => ["All", ...Array.from(new Set(rows.map((r) => r.currency)))],
    [rows],
  );
  const types = useMemo(
    () => ["All", ...Array.from(new Set(rows.map((r) => kindLabel[r.kind] ?? r.kind)))],
    [rows],
  );
  const statuses = useMemo(
    () => ["All", ...Array.from(new Set(rows.map((r) => r.status)))],
    [rows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (currency !== "All" && r.currency !== currency) return false;
      if (type !== "All" && (kindLabel[r.kind] ?? r.kind) !== type) return false;
      if (status !== "All" && r.status !== status) return false;
      if (
        q &&
        !r.ref.toLowerCase().includes(q) &&
        !r.title.toLowerCase().includes(q) &&
        !r.sub.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [rows, query, currency, type, status]);

  const selected =
    filtered.find((r) => r.id === selectedId) ?? filtered[0] ?? null;

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
            placeholder="Search transaction ref..." data-i18n-placeholder={"[\"ui.1263gym\",\"Search transaction ref...\"]"}
            className="w-full bg-transparent text-[13px] text-slate-900 placeholder:text-slate-500 focus:outline-none"
          />
        </div>
        <Dropdown label="Currency" value={currency} options={currencies} onChange={setCurrency} />
        <Dropdown label="Type" value={type} options={types} onChange={setType} />
        <Dropdown label="Status" value={status} options={statuses} onChange={setStatus} />
        <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[13px] font-semibold text-slate-900 transition-colors hover:bg-slate-50">
          <Calendar className="size-3.5 text-slate-500" />
          <I18nText i18nKey="ui.ll7v9v" source="Last 30 Days" /></button>
      </div>

      {/* Split workspace */}
      <div className="flex flex-1 flex-col gap-6 xl:flex-row xl:items-start">
        {/* Table */}
        <div className="flex min-w-0 flex-1 flex-col overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3 text-[11px] font-bold text-slate-500">
            <span className="w-[120px]"><I18nText i18nKey="ui.viiv38" source="DATE & TIME" /></span>
            <span className="w-[260px]"><I18nText i18nKey="ui.i91n7t" source="DESCRIPTION" /></span>
            <span className="w-[80px]"><I18nText i18nKey="ui.1uk0j1y" source="CURRENCY" /></span>
            <span className="w-[120px] text-right"><I18nText i18nKey="ui.1xotqa1" source="AMOUNT" /></span>
            <span className="w-[80px] text-right"><I18nText i18nKey="ui.ijvun7" source="FEE" /></span>
            <span className="w-[100px] text-center"><I18nText i18nKey="ui.165vtrj" source="STATUS" /></span>
          </div>
          <div className="flex flex-col">
            {filtered.map((r) => {
              const Icon = kindIcon[r.kind] ?? ArrowUpRight;
              const positive = r.amount > 0;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={`flex items-center justify-between border-b border-slate-200 px-6 py-3.5 text-left transition-colors hover:bg-slate-50 ${
                    selected?.id === r.id ? "bg-emerald-50/25" : ""
                  }`}
                >
                  <span className="w-[120px] text-[13px] text-slate-600">
                    {r.dateLabel}
                  </span>
                  <div className="flex w-[260px] items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-50">
                      <Icon className="size-3.5 text-slate-700" />
                    </div>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <p className="truncate text-[13px] font-semibold text-slate-900">
                        {r.title}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">
                        {r.sub}
                      </p>
                    </div>
                  </div>
                  <span className="w-[80px] text-[13px] font-bold text-slate-900">
                    {r.currency}
                  </span>
                  <span
                    className={`w-[120px] text-right font-mono text-[13px] font-bold ${
                      positive ? "text-emerald-500" : "text-slate-900"
                    }`}
                  >
                    {formatCurrency(r.amount, r.currency, { sign: true })}
                  </span>
                  <span className="w-[80px] text-right font-mono text-[13px] text-slate-500">
                    {formatCurrency(r.fee, r.currency)}
                  </span>
                  <div className="flex w-[100px] justify-center">
                    <Badge tone={statusTone[r.status] ?? "neutral"}>
                      {r.status}
                    </Badge>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="px-6 py-10 text-center text-[13px] text-slate-500">
                <I18nText i18nKey="ui.1d46kx0" source="No transactions match your filters." /></div>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
            <p className="text-[13px] text-slate-500">
              <I18nText i18nKey="ui.1j6rifw" source="Showing" />{filtered.length} <I18nText i18nKey="ui.t6uqnc" source="of" />{rows.length} <I18nText i18nKey="ui.13bg7w0" source="transactions" /></p>
            <div className="flex items-center gap-2">
              <button className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100">
                <I18nText i18nKey="ui.1t5jxvs" source="Previous" /></button>
              <span className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-bold text-white">
                <I18nText i18nKey="ui.efwnq4" source="1" /></span>
              <button className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-900 transition-colors hover:bg-slate-50">
                <I18nText i18nKey="ui.1padbm0" source="Next" /></button>
            </div>
          </div>
        </div>

        {/* Detail drawer */}
        {selected && (
          <div className="flex w-full shrink-0 flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 xl:w-[340px]">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-slate-900">
                <I18nText i18nKey="ui.1m2bz4x" source="Transaction Details" /></h2>
              <button
                aria-label="Close" data-i18n-aria-label={"[\"ui.1l0xxoj\",\"Close\"]"}
                onClick={() => setSelectedId("")}
                className="text-slate-500 hover:text-slate-900"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-[18px]">
              <p className="text-[11px] font-bold text-slate-500">
                <I18nText i18nKey="ui.168cw64" source="TRANSACTION ID" /></p>
              <p className="font-mono text-sm font-bold text-slate-900">
                {selected.ref}
              </p>
              <div className="w-full border-t border-slate-200" />
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-2xl font-extrabold text-slate-900">
                  {formatCurrency(selected.amount, selected.currency, {
                    sign: true,
                  })}
                </span>
                <span className="text-sm font-semibold text-slate-500">
                  {selected.currency}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3.5 text-xs">
              {[
                { label: "Counterparty", value: selected.party ?? selected.title, mono: false },
                { label: "Wallet Source", value: selected.walletSource ?? `${selected.currency} Wallet`, mono: false },
                { label: "Estimated Delivery", value: selected.delivery ?? "Instantaneous", mono: false },
                { label: "Reference Code", value: selected.reference ?? selected.ref, mono: true },
              ].map((s) => (
                <div key={s.label} className="flex items-start justify-between gap-4">
                  <span className="shrink-0 text-slate-500"><I18nText source={s.label} /></span>
                  <span
                    className={`text-right font-semibold text-slate-900 ${
                      s.mono ? "font-mono" : ""
                    }`}
                  >
                    {s.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-xs font-bold text-slate-500"><I18nText i18nKey="ui.1xtpnsc" source="TIMELINE STATUS" /></p>
              <div className="flex flex-col gap-3">
                {[
                  `Transfer Initiated — ${selected.timeLabel}`,
                  `Locked Conversion Audit — ${selected.timeLabel}`,
                  selected.status === "Completed"
                    ? `Settlement Cleared — ${selected.timeLabel}`
                    : `Status: ${selected.status}`,
                ].map((t) => (
                  <div key={t} className="flex items-center gap-3">
                    <span
                      className={`size-2 shrink-0 rounded-full ${
                        selected.status === "Failed"
                          ? "bg-red-500"
                          : "bg-emerald-500"
                      }`}
                    />
                    <p className="text-xs font-semibold text-slate-900">{t}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full border-t border-slate-200" />

            <button className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 p-3 text-[13px] font-semibold text-white transition-colors hover:bg-slate-800">
              <Download className="size-3.5" />
              <I18nText i18nKey="ui.1ctoj33" source="Download PDF Receipt" /></button>
          </div>
        )}
      </div>
    </>
  );
}
