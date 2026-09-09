import { Search, ChevronDown, Download } from "lucide-react";
import Badge from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

const filters = ["Route: All", "Status: All"];

const kpis = [
  { label: "FEE REVENUE (MTD)", value: "$142.8K", tone: "text-emerald-500", sub: "+8.4% vs last month" },
  { label: "AVG FEE RATE", value: "0.42%", tone: "text-slate-900", sub: "Blended across routes" },
  { label: "FEE-FREE TXNS", value: "68%", tone: "text-blue-500", sub: "Internal Vault transfers" },
  { label: "LIMIT BREACHES", value: "31", tone: "text-amber-500", sub: "Auto-blocked this week" },
];

const globalLimits = [
  { label: "Daily transfer cap", value: "$50,000.00" },
  { label: "Single transaction cap", value: "$25,000.00" },
  { label: "Monthly accumulative", value: "$250,000.00" },
];

const tierLimits = [
  { tier: "Tier 1", value: "$2,500 / day" },
  { tier: "Tier 2", value: "$25,000 / day" },
  { tier: "Tier 3", value: "$50,000 / day" },
];

export default async function AdminFeesPage() {
  await requireAdmin();

  const fees = await prisma.fee.findMany({ orderBy: { sort: "asc" } });

  return (
    <div className="flex h-full flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-extrabold text-slate-900">
            Fees &amp; Limits
          </h1>
          <p className="text-sm text-slate-600">
            Manage the platform fee schedule, tier pricing and settlement
            thresholds.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-900 transition-colors hover:bg-slate-50">
          <Download className="size-3.5 text-slate-500" />
          Export Schedule
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
            placeholder="Search fee type..."
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
        {/* Fee schedule table */}
        <div className="flex min-w-0 flex-1 flex-col overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 py-3 text-[11px] font-bold text-slate-500">
            <span className="flex-1">TRANSACTION TYPE</span>
            <span className="w-[150px]">TIER</span>
            <span className="w-[120px] text-right">FEE</span>
            <span className="w-[90px] text-right">STATUS</span>
          </div>
          <div className="flex flex-col">
            {fees.map((f) => (
              <div
                key={f.id}
                className="flex items-center border-b border-slate-200 px-6 py-3.5"
              >
                <div className="flex flex-1 flex-col gap-0.5">
                  <p className="text-[13px] font-semibold text-slate-900">
                    {f.name}
                  </p>
                  <p className="text-[11px] text-slate-500">{f.detail}</p>
                </div>
                <span className="w-[150px] text-[13px] text-slate-600">
                  {f.tier ?? "All tiers"}
                </span>
                <span className="w-[120px] text-right font-mono text-[13px] font-semibold text-slate-900">
                  {f.amount}
                </span>
                <div className="flex w-[90px] justify-end">
                  <Badge tone="success">Active</Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
            <p className="text-[13px] text-slate-500">
              {fees.length} fee rules configured
            </p>
            <button className="text-[13px] font-semibold text-blue-500 hover:text-blue-600">
              + Add Fee Rule
            </button>
          </div>
        </div>

        {/* Global limits */}
        <div className="flex w-full shrink-0 flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 xl:w-[360px]">
          <h2 className="text-[15px] font-bold text-slate-900">Global Limits</h2>

          <div className="flex flex-col gap-3">
            {globalLimits.map((l) => (
              <div
                key={l.label}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5"
              >
                <span className="text-[13px] text-slate-900">{l.label}</span>
                <span className="font-mono text-[13px] font-semibold text-slate-900">
                  {l.value}
                </span>
              </div>
            ))}
          </div>

          <div className="w-full border-t border-slate-200" />

          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold text-slate-500">PER-TIER DAILY CAP</p>
            {tierLimits.map((t) => (
              <div key={t.tier} className="flex items-center justify-between">
                <span className="text-[13px] text-slate-900">{t.tier}</span>
                <span className="font-mono text-[13px] font-semibold text-slate-900">
                  {t.value}
                </span>
              </div>
            ))}
          </div>

          <div className="w-full border-t border-slate-200" />

          {/* Utilization */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                NETWORK DAILY UTILIZATION
              </span>
              <span className="text-[13px] font-bold text-amber-500">62%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-[62%] rounded-full bg-amber-500" />
            </div>
          </div>

          <button className="rounded-lg bg-slate-900 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-slate-800">
            Adjust Limits
          </button>
        </div>
      </div>
    </div>
  );
}
