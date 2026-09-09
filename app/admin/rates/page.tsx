import { Search, ChevronDown, RefreshCw } from "lucide-react";
import Badge from "@/components/ui/badge";
import Toggle from "@/components/ui/toggle";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { formatNumber } from "@/lib/format";

const filters = ["Base: All", "Status: All"];

const tierMarkups = [
  { tier: "Tier 1", value: "0.50%" },
  { tier: "Tier 2", value: "0.25%" },
  { tier: "Tier 3", value: "0.05%" },
];

function fmtRate(rate: number): string {
  return rate >= 100 ? formatNumber(rate, 2) : formatNumber(rate, 4);
}

export default async function AdminRatesPage() {
  await requireAdmin();

  const rows = await prisma.fxRate.findMany({ orderBy: { sort: "asc" } });
  const pairs = rows.filter((r) => r.base !== r.quote);

  const kpis = [
    { label: "ACTIVE PAIRS", value: String(pairs.length), tone: "text-slate-900", sub: "Live FX corridors" },
    { label: "AVG SPREAD", value: "0.35%", tone: "text-emerald-500", sub: "Below market median" },
    { label: "FX VOLUME (24H)", value: "$1.82M", tone: "text-blue-500", sub: "6,204 conversions" },
    { label: "LAST SYNC", value: "08:42", tone: "text-amber-500", sub: "UTC · 3 min ago" },
  ];

  return (
    <div className="flex h-full flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-extrabold text-slate-900">
            Exchange Rate Management
          </h1>
          <p className="text-sm text-slate-600">
            Configure institutional FX pairs, spreads and the markup applied to
            customer conversions.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-900 transition-colors hover:bg-slate-50">
          <RefreshCw className="size-3.5 text-slate-500" />
          Sync Rates
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
            placeholder="Search currency pair..."
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
        {/* Pairs table */}
        <div className="flex min-w-0 flex-1 flex-col overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 py-3 text-[11px] font-bold text-slate-500">
            <span className="flex-1">PAIR</span>
            <span className="w-[120px] text-right">MID-MARKET</span>
            <span className="w-[120px] text-right">VAULT RATE</span>
            <span className="w-[90px] text-right">SPREAD</span>
            <span className="w-[90px] text-right">24H</span>
            <span className="w-[90px] text-right">STATUS</span>
          </div>
          <div className="flex flex-col">
            {pairs.map((p) => {
              const vault = p.rate * 0.997;
              const down = p.changeTone === "down";
              return (
                <div
                  key={p.id}
                  className="flex items-center border-b border-slate-200 px-6 py-3.5"
                >
                  <span className="flex-1 text-[13px] font-bold text-slate-900">
                    {p.base} → {p.quote}
                  </span>
                  <span className="w-[120px] text-right font-mono text-[13px] text-slate-600">
                    {fmtRate(p.rate)}
                  </span>
                  <span className="w-[120px] text-right font-mono text-[13px] font-semibold text-slate-900">
                    {fmtRate(vault)}
                  </span>
                  <span className="w-[90px] text-right font-mono text-[13px] text-slate-600">
                    {p.spread ?? "0.30%"}
                  </span>
                  <span
                    className={`w-[90px] text-right font-mono text-[13px] font-semibold ${
                      down ? "text-red-500" : "text-emerald-500"
                    }`}
                  >
                    {p.change ?? "—"}
                  </span>
                  <div className="flex w-[90px] justify-end">
                    <Badge tone="success">Live</Badge>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
            <p className="text-[13px] text-slate-500">
              Showing {pairs.length} of {pairs.length} active pairs
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

        {/* Markup configuration */}
        <div className="flex w-full shrink-0 flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 xl:w-[360px]">
          <h2 className="text-[15px] font-bold text-slate-900">
            Markup Configuration
          </h2>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500">
              GLOBAL BASE MARKUP
            </label>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="font-mono text-lg font-bold text-slate-900">
                0.05%
              </span>
              <span className="text-[11px] text-slate-500">applied to mid</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold text-slate-500">PER-TIER MARKUP</p>
            {tierMarkups.map((t) => (
              <div
                key={t.tier}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5"
              >
                <span className="text-[13px] text-slate-900">{t.tier}</span>
                <span className="font-mono text-[13px] font-semibold text-slate-900">
                  {t.value}
                </span>
              </div>
            ))}
          </div>

          <div className="w-full border-t border-slate-200" />

          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <p className="text-[13px] font-semibold text-slate-900">
                Rate Source
              </p>
              <p className="text-[11px] text-slate-500">Reuters / Bloomberg feed</p>
            </div>
            <Badge tone="success">Live</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <p className="text-[13px] font-semibold text-slate-900">
                Auto-sync (60s)
              </p>
              <p className="text-[11px] text-slate-500">Continuous rate refresh</p>
            </div>
            <Toggle defaultOn aria-label="Auto-sync rates" />
          </div>

          <button className="rounded-lg bg-slate-900 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-slate-800">
            Publish Rate Changes
          </button>
        </div>
      </div>
    </div>
  );
}
