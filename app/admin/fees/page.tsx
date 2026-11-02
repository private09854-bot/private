import { Search, ChevronDown, Download } from "lucide-react";
import Badge from "@/components/ui/badge";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/session";
import { usdRateMap } from "@/lib/data";
import { formatCompact, formatCurrency } from "@/lib/format";
import { I18nText } from "@/components/i18n-text";

const filters = ["Route: All", "Status: All"];

export default async function AdminFeesPage() {
  await requireAdmin();

  const [feesRes, txRes, settingsRes, usersRes, rates] = await Promise.all([
    supabaseAdmin.from("fees").select("*").order("sort"),
    supabaseAdmin.from("transactions").select("fee,currency"),
    supabaseAdmin.from("user_settings").select("*"),
    supabaseAdmin.from("profiles").select("tier").eq("role", "CUSTOMER"),
    usdRateMap(),
  ]);

  const fees = feesRes.data ?? [];
  const txns = txRes.data ?? [];
  const settings = settingsRes.data ?? [];
  const users = usersRes.data ?? [];

  const usd = (amount: number, currency: string) =>
    amount * (rates.get(currency) ?? 0);

  const feeTxns = txns.filter((t) => t.fee > 0);
  const totalFees = txns.reduce((s, t) => s + usd(t.fee, t.currency), 0);
  const avgFee = feeTxns.length ? totalFees / feeTxns.length : 0;
  const feeFreePct = txns.length
    ? Math.round((txns.filter((t) => t.fee === 0).length / txns.length) * 100)
    : 0;

  const kpis = [
    { label: "FEES COLLECTED", value: formatCompact(totalFees), tone: "text-emerald-500", sub: "Across {{count}} transactions", subValues: { count: txns.length } },
    { label: "AVG FEE", value: formatCurrency(avgFee, "USD"), tone: "text-slate-900", sub: "On {{count}} charged transfers", subValues: { count: feeTxns.length } },
    { label: "FEE-FREE TXNS", value: `${feeFreePct}%`, tone: "text-blue-500", sub: "Zero-fee transfers", subValues: {} },
    { label: "FEE RULES", value: String(fees.length), tone: "text-amber-500", sub: "Active in schedule", subValues: {} },
  ];

  // Platform limits derived from the highest configured customer settings.
  const dailyCap = Math.max(50000, ...settings.map((s) => s.dailyLimit));
  const singleCap = Math.max(10000, ...settings.map((s) => s.singleCap));
  const monthlyCap = Math.max(500000, ...settings.map((s) => s.monthlyLimit));
  const globalLimits = [
    { label: "Daily transfer cap", value: `${formatCurrency(dailyCap, "USD")}` },
    { label: "Single transaction cap", value: `${formatCurrency(singleCap, "USD")}` },
    { label: "Monthly accumulative", value: `${formatCurrency(monthlyCap, "USD")}` },
  ];

  const tierCounts = ["Tier 3", "Tier 2", "Tier 1"].map((tier) => ({
    tier,
    count: users.filter((u) => u.tier === tier).length,
  }));

  const totalUsed = settings.reduce((s, x) => s + x.dailyUsed, 0);
  const totalDaily = settings.reduce((s, x) => s + x.dailyLimit, 0) || 1;
  const utilization = Math.min(100, Math.round((totalUsed / totalDaily) * 100));

  return (
    <div className="flex h-full flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-extrabold text-slate-900">
            <I18nText i18nKey="ui.3mfp2a" source="Fees & Limits" /></h1>
          <p className="text-sm text-slate-600">
            <I18nText i18nKey="ui.e1g5db" source="Manage the platform fee schedule, tier pricing and settlement thresholds." /></p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-900 transition-colors hover:bg-slate-50">
          <Download className="size-3.5 text-slate-500" />
          <I18nText i18nKey="ui.1frbgqg" source="Export Schedule" /></button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-5"
          >
            <p className="text-[11px] font-bold tracking-[0.5px] text-slate-500">
              <I18nText source={k.label} />
            </p>
            <p className={`text-2xl font-extrabold ${k.tone}`}>{k.value}</p>
            <p className="text-[11px] text-slate-600"><I18nText source={k.sub} values={k.subValues} /></p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <Search className="size-3.5 shrink-0 text-slate-500" />
          <input
            type="text"
            placeholder="Search fee type..." data-i18n-placeholder={"[\"ui.17b5alb\",\"Search fee type...\"]"}
            className="w-full bg-transparent text-[13px] text-slate-900 placeholder:text-slate-500 focus:outline-none"
          />
        </div>
        {filters.map((f) => (
          <button
            key={f}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[13px] font-semibold text-slate-900 transition-colors hover:bg-slate-50"
          >
            <I18nText source={f} />
            <ChevronDown className="size-2.5 text-slate-500" />
          </button>
        ))}
      </div>

      {/* Split workspace */}
      <div className="flex flex-1 flex-col gap-6 xl:flex-row xl:items-start">
        {/* Fee schedule table */}
        <div className="flex min-w-0 flex-1 flex-col overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 py-3 text-[11px] font-bold text-slate-500">
            <span className="flex-1"><I18nText i18nKey="ui.4m2zdd" source="TRANSACTION TYPE" /></span>
            <span className="w-[150px]"><I18nText i18nKey="ui.r54utl" source="TIER" /></span>
            <span className="w-[120px] text-right"><I18nText i18nKey="ui.ijvun7" source="FEE" /></span>
            <span className="w-[90px] text-right"><I18nText i18nKey="ui.165vtrj" source="STATUS" /></span>
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
                  <Badge tone="success"><I18nText i18nKey="ui.8qzyhb" source="Active" /></Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
            <p className="text-[13px] text-slate-500">
              {fees.length} <I18nText i18nKey="ui.1hsyzgk" source="fee rules configured" /></p>
            <button className="text-[13px] font-semibold text-blue-500 hover:text-blue-600">
              <I18nText i18nKey="ui.1g7qo1" source="+ Add Fee Rule" /></button>
          </div>
        </div>

        {/* Global limits */}
        <div className="flex w-full shrink-0 flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 xl:w-[360px]">
          <h2 className="text-[15px] font-bold text-slate-900"><I18nText i18nKey="ui.1tyuo5a" source="Global Limits" /></h2>

          <div className="flex flex-col gap-3">
            {globalLimits.map((l) => (
              <div
                key={l.label}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5"
              >
                <span className="text-[13px] text-slate-900"><I18nText source={l.label} /></span>
                <span className="font-mono text-[13px] font-semibold text-slate-900">
                  {l.value}
                </span>
              </div>
            ))}
          </div>

          <div className="w-full border-t border-slate-200" />

          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold text-slate-500"><I18nText i18nKey="ui.1g376jx" source="CUSTOMERS BY TIER" /></p>
            {tierCounts.map((t) => (
              <div key={t.tier} className="flex items-center justify-between">
                <span className="text-[13px] text-slate-900">{t.tier}</span>
                <span className="font-mono text-[13px] font-semibold text-slate-900">
                  {t.count} {t.count === 1 ? <I18nText i18nKey="ui.qrm3n6" source="user" /> : <I18nText i18nKey="ui.q7t3bn" source="users" />}
                </span>
              </div>
            ))}
          </div>

          <div className="w-full border-t border-slate-200" />

          {/* Utilization */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                <I18nText i18nKey="ui.1n3ae60" source="NETWORK DAILY UTILIZATION" /></span>
              <span className="text-[13px] font-bold text-amber-500">
                {utilization}<I18nText i18nKey="ui.8w4luo" source="%" /></span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-amber-500"
                style={{ width: `${utilization}%` }}
              />
            </div>
          </div>

          <button className="rounded-lg bg-slate-900 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-slate-800">
            <I18nText i18nKey="ui.14jqz72" source="Adjust Limits" /></button>
        </div>
      </div>
    </div>
  );
}
