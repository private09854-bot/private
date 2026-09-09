import { Download } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { usdRateMap } from "@/lib/data";
import { formatCompact } from "@/lib/format";
import AdminTxnView, { type AdminTxn } from "./admin-txn-view";

export default async function AdminTransactionsPage() {
  await requireAdmin();

  const [txns, rates] = await Promise.all([
    prisma.transaction.findMany({ orderBy: { date: "desc" } }),
    usdRateMap(),
  ]);

  const processed = txns.reduce(
    (s, t) => s + Math.abs(t.amount * (rates.get(t.currency) ?? 0)),
    0,
  );
  const flaggedCount = txns.filter((t) => t.flagged).length;
  const completedCount = txns.filter((t) => t.status === "Completed").length;

  const kpis = [
    { label: "PROCESSED (ALL)", value: formatCompact(processed), tone: "text-slate-900", sub: `${txns.length} settlements` },
    { label: "PENDING", value: String(txns.filter((t) => t.status === "Pending" || t.status === "Processing").length), tone: "text-amber-500", sub: "Awaiting settlement" },
    { label: "FLAGGED", value: String(flaggedCount), tone: "text-red-500", sub: "Flagged for review" },
    { label: "COMPLETED", value: String(completedCount), tone: "text-emerald-500", sub: "Settled successfully" },
  ];

  const rows: AdminTxn[] = txns.map((t) => ({
    id: t.id,
    ref: t.ref,
    party: t.party ?? t.title,
    partySub: t.partySub ?? t.sub,
    route: t.route ?? "Internal",
    currency: t.currency,
    amount: t.amount,
    risk: t.risk ?? "Low",
    status: t.status,
    flagged: t.flagged,
  }));

  return (
    <div className="flex h-full flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-extrabold text-slate-900">
            Transaction Monitoring
          </h1>
          <p className="text-sm text-slate-600">
            Live oversight of network settlement flows, wire routing and flagged
            activity.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-900 transition-colors hover:bg-slate-50">
          <Download className="size-3.5 text-slate-500" />
          Export Ledger
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

      <AdminTxnView rows={rows} />
    </div>
  );
}
