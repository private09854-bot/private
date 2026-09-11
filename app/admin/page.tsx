import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/session";
import { usdRateMap } from "@/lib/data";
import { formatCompact } from "@/lib/format";

const Divider = () => <div className="h-px w-full bg-slate-200" />;

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FILLS: Record<string, string> = {
  USD: "bg-slate-900",
  EUR: "bg-blue-500",
  GBP: "bg-amber-500",
  NGN: "bg-emerald-500",
  CAD: "bg-slate-500",
  Other: "bg-slate-400",
};

const alertStyle: Record<string, { tone: string; dot: string }> = {
  critical: { tone: "border-red-500 bg-red-50", dot: "bg-red-500" },
  medium: { tone: "border-amber-500 bg-amber-100", dot: "bg-amber-500" },
  warning: { tone: "border-amber-500 bg-amber-100", dot: "bg-amber-500" },
  notice: { tone: "border-emerald-500 bg-emerald-50", dot: "bg-emerald-500" },
};

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [
    totalUsersRes,
    verifiedUsersRes,
    pendingTransfersRes,
    kycPendingRes,
    flaggedAlertsRes,
    txRes,
    walletsRes,
    rates,
    alertsRes,
    gatewaysRes,
  ] = await Promise.all([
    supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
    supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("kycStatus", "Verified"),
    supabaseAdmin
      .from("transfers")
      .select("*", { count: "exact", head: true })
      .eq("status", "Pending"),
    supabaseAdmin
      .from("kyc_applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabaseAdmin
      .from("risk_flags")
      .select("*", { count: "exact", head: true })
      .or("critical.eq.true,score.gt.80"),
    supabaseAdmin.from("transactions").select("amount,currency,date"),
    supabaseAdmin
      .from("wallets")
      .select("balance,currency,profiles!inner(role)")
      .eq("profiles.role", "CUSTOMER"),
    usdRateMap(),
    supabaseAdmin.from("alerts").select("*").order("sort"),
    supabaseAdmin.from("gateways").select("*").order("sort"),
  ]);

  const totalUsers = totalUsersRes.count ?? 0;
  const verifiedUsers = verifiedUsersRes.count ?? 0;
  const pendingTransfers = pendingTransfersRes.count ?? 0;
  const kycPending = kycPendingRes.count ?? 0;
  const flaggedAlerts = flaggedAlertsRes.count ?? 0;
  const txns = txRes.data ?? [];
  const wallets = walletsRes.data ?? [];
  const alerts = alertsRes.data ?? [];
  const gateways = gatewaysRes.data ?? [];

  const usd = (amount: number, currency: string) =>
    amount * (rates.get(currency) ?? 0);

  const volumeToday = txns.reduce(
    (s, t) => s + Math.abs(usd(t.amount, t.currency)),
    0,
  );

  // 7-day volume bars (grouped by weekday, Mon..Sun)
  const byDay = new Array(7).fill(0);
  for (const t of txns) {
    const jsDay = new Date(t.date).getDay(); // 0=Sun
    const idx = jsDay === 0 ? 6 : jsDay - 1; // Mon=0..Sun=6
    byDay[idx] += Math.abs(usd(t.amount, t.currency));
  }
  const maxDay = Math.max(...byDay, 1);
  const bars = DAYS.map((day, i) => ({
    day,
    value: formatCompact(byDay[i]),
    h: Math.max(6, Math.round((byDay[i] / maxDay) * 140)),
  }));

  // Currency distribution across all wallet holdings (USD-weighted)
  const byCurrency = new Map<string, number>();
  for (const w of wallets)
    byCurrency.set(
      w.currency,
      (byCurrency.get(w.currency) ?? 0) + Math.abs(usd(w.balance, w.currency)),
    );
  const totalHoldings = Array.from(byCurrency.values()).reduce((a, b) => a + b, 0) || 1;
  const distribution = Array.from(byCurrency.entries())
    .map(([code, value]) => ({ code, pct: Math.round((value / totalHoldings) * 100) }))
    .sort((a, b) => b.pct - a.pct);

  const kpis = [
    { label: "TOTAL USERS", value: totalUsers.toLocaleString(), tone: "text-emerald-500", sub: "Registered accounts" },
    { label: "VERIFIED USERS", value: verifiedUsers.toLocaleString(), tone: "text-blue-500", sub: "KYC Tier complete" },
    { label: "VOLUME (ALL)", value: formatCompact(volumeToday), tone: "text-slate-900", sub: "SWIFT & Wire routes" },
    { label: "PENDING TRANSFERS", value: String(pendingTransfers), tone: "text-amber-500", sub: "Awaiting auth" },
    { label: "KYC PENDING", value: String(kycPending), tone: "text-blue-500", sub: "Manual review queue" },
    { label: "FLAGGED ALERTS", value: String(flaggedAlerts), tone: "text-red-500", sub: "Risk score > 80" },
  ];

  return (
    <div className="flex h-full flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[28px] font-extrabold text-slate-900">
          System Overview
        </h1>
        <p className="text-sm text-slate-600">
          Institutional network health, counterparty exposure and priority
          flags.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
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

      {/* Charts row */}
      <div className="flex flex-col items-start gap-6 xl:flex-row">
        {/* Volume bar chart */}
        <div className="flex w-full flex-1 flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-[15px] font-bold text-slate-900">
                Transaction Volume (7 Days)
              </p>
              <p className="text-xs text-slate-500">
                USD equivalent (Consolidated)
              </p>
            </div>
            <button className="text-xs font-semibold text-blue-500 hover:text-blue-600">
              Export Report
            </button>
          </div>
          <Divider />
          <div className="flex h-[160px] items-end justify-between">
            {bars.map((b) => (
              <div key={b.day} className="flex flex-1 flex-col items-center gap-2">
                <p className="text-[11px] font-bold text-slate-500">{b.value}</p>
                <div
                  className="w-8 rounded-t bg-slate-900"
                  style={{ height: `${b.h}px` }}
                />
                <p className="text-[11px] text-slate-600">{b.day}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Currency distribution */}
        <div className="flex w-full flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 xl:w-[420px]">
          <p className="text-[15px] font-bold text-slate-900">
            Currency Distribution
          </p>
          <Divider />
          <div className="flex flex-col gap-4">
            {distribution.map((d) => (
              <div key={d.code} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{d.code}</span>
                  <span className="text-slate-600">{d.pct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-[4px] bg-slate-200">
                  <div
                    className={`h-full rounded-[4px] ${FILLS[d.code] ?? FILLS.Other}`}
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower split row */}
      <div className="flex flex-col items-start gap-6 xl:flex-row">
        {/* System alerts */}
        <div className="flex w-full flex-1 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-base font-bold text-slate-900">
            System Alerts (Priority Queue)
          </p>
          <div className="flex flex-col gap-3">
            {alerts.map((a) => {
              const st = alertStyle[a.severity] ?? alertStyle.notice;
              return (
                <div
                  key={a.id}
                  className={`flex items-center gap-4 rounded-lg border p-3 ${st.tone}`}
                >
                  <span className={`size-2 shrink-0 rounded-full ${st.dot}`} />
                  <div className="flex flex-1 flex-col gap-0.5">
                    <p className="text-[13px] font-bold text-slate-900">
                      {a.title}
                    </p>
                    <p className="text-xs text-slate-600">{a.detail}</p>
                  </div>
                  <p className="shrink-0 text-[11px] text-slate-500">{a.when}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gateway status */}
        <div className="flex w-full flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 xl:w-[420px]">
          <p className="text-base font-bold text-slate-900">Gateway Status</p>
          <Divider />
          <div className="flex flex-col gap-4">
            {gateways.map((g) => {
              const ok = g.status !== "Degraded";
              return (
                <div key={g.id} className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[13px] font-semibold text-slate-900">
                      {g.name}
                    </p>
                    <p className="text-[11px] text-slate-500">{g.status}</p>
                  </div>
                  <span
                    className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${
                      ok
                        ? "bg-emerald-50 text-emerald-500"
                        : "bg-amber-100 text-amber-500"
                    }`}
                  >
                    {g.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
