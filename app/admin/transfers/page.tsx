import { ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { formatCompact } from "@/lib/format";
import TransfersQueue, { type TransferRow } from "./transfers-queue";

export default async function AdminTransfersPage() {
  await requireAdmin();

  const transfers = await prisma.transfer.findMany({
    orderBy: { createdAt: "asc" },
  });

  const pendingList = transfers.filter((t) => t.status === "Pending");
  const pendingValue = pendingList.reduce((s, t) => s + t.amount, 0);

  const kpis = [
    {
      label: "AWAITING AUTH",
      value: String(pendingList.length),
      tone: "text-amber-500",
      sub: "Dual-signature required",
    },
    {
      label: "PENDING VALUE",
      value: formatCompact(pendingValue),
      tone: "text-slate-900",
      sub: `Across ${pendingList.length} instructions`,
    },
    {
      label: "AUTHORIZED",
      value: String(transfers.filter((t) => t.status === "Authorized").length),
      tone: "text-emerald-500",
      sub: "Settled successfully",
    },
    {
      label: "REJECTED",
      value: String(transfers.filter((t) => t.status === "Rejected").length),
      tone: "text-red-500",
      sub: "Policy or risk holds",
    },
  ];

  const rows: TransferRow[] = transfers.map((t) => ({
    id: t.id,
    ref: t.ref,
    party: t.party,
    partySub: t.partySub ?? "",
    route: t.route,
    amount: t.amount,
    submitted: t.submitted,
    risk: t.risk ?? "Low",
    status: t.status,
  }));

  return (
    <div className="flex h-full flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-extrabold text-slate-900">
            Transfer Authorization
          </h1>
          <p className="text-sm text-slate-600">
            Approve or reject high-value and flagged settlement instructions
            awaiting signature.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-900 transition-colors hover:bg-slate-50">
          <ShieldCheck className="size-3.5 text-slate-500" />
          Bulk Authorize
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

      <TransfersQueue transfers={rows} />
    </div>
  );
}
