import { Search, ChevronDown, RefreshCw } from "lucide-react";
import Badge from "@/components/ui/badge";
import Toggle from "@/components/ui/toggle";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/session";
import { usdRateMap } from "@/lib/data";
import { formatNumber, formatCompact } from "@/lib/format";
import { I18nText } from "@/components/i18n-text";

const filters = ["Base: All", "Status: All"];

function fmtRate(rate: number): string {
  return rate >= 100 ? formatNumber(rate, 2) : formatNumber(rate, 4);
}

export default async function AdminRatesPage() {
  await requireAdmin();

  const [rowsRes, convertRes, rates] = await Promise.all([
    supabaseAdmin.from("fx_rates").select("*").order("sort"),
    supabaseAdmin
      .from("transactions")
      .select("amount,currency")
      .eq("kind", "convert"),
    usdRateMap(),
  ]);

  const rows = rowsRes.data ?? [];
  const convertTxns = convertRes.data ?? [];
  const pairs = rows.filter((r) => r.base !== r.quote);

  const spreadVals = pairs
    .map((p) => parseFloat((p.spread ?? "").replace("%", "")))
    .filter((n) => Number.isFinite(n));
  const avgSpread = spreadVals.length
    ? (spreadVals.reduce((a, b) => a + b, 0) / spreadVals.length).toFixed(2)
    : "0.00";
  const fxVolume = convertTxns.reduce(
    (s, t) => s + Math.abs(t.amount * (rates.get(t.currency) ?? 0)),
    0,
  );

  const kpis = [
    {
      label: "ACTIVE PAIRS",
      value: String(pairs.length),
      tone: "text-slate-900",
      sub: "Live FX corridors",
      subValues: {},
    },
    {
      label: "AVG SPREAD",
      value: `${avgSpread}%`,
      tone: "text-emerald-500",
      sub: "Blended across pairs",
      subValues: {},
    },
    {
      label: "FX VOLUME",
      value: formatCompact(fxVolume),
      tone: "text-blue-500",
      sub: "{{count}} conversions",
      subValues: { count: convertTxns.length },
    },
    {
      label: "CONVERSIONS",
      value: String(convertTxns.length),
      tone: "text-amber-500",
      sub: "Total FX swaps",
      subValues: {},
    },
  ];

  return (
    <div className="flex h-full flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-extrabold text-slate-900">
            <I18nText i18nKey="ui.1w7vj19" source="Exchange Rate Management" /></h1>
          <p className="text-sm text-slate-600">
            <I18nText i18nKey="ui.1lr406w" source="Configure institutional FX pairs, spreads and the markup applied to customer conversions." /></p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-900 transition-colors hover:bg-slate-50">
          <RefreshCw className="size-3.5 text-slate-500" />
          <I18nText i18nKey="ui.10bbect" source="Sync Rates" /></button>
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
            placeholder="Search currency pair..." data-i18n-placeholder={"[\"ui.1s3z7v6\",\"Search currency pair...\"]"}
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
        {/* Pairs table */}
        <div className="flex min-w-0 flex-1 flex-col overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 py-3 text-[11px] font-bold text-slate-500">
            <span className="flex-1"><I18nText i18nKey="ui.s4mp69" source="PAIR" /></span>
            <span className="w-[120px] text-right"><I18nText i18nKey="ui.9ift6o" source="MID-MARKET" /></span>
            <span className="w-[120px] text-right"><I18nText i18nKey="ui.1boecvb" source="RATE" /></span>
            <span className="w-[90px] text-right"><I18nText i18nKey="ui.a0w2ku" source="SPREAD" /></span>
            <span className="w-[90px] text-right"><I18nText i18nKey="ui.1ysqse5" source="CHANGE" /></span>
            <span className="w-[90px] text-right"><I18nText i18nKey="ui.165vtrj" source="STATUS" /></span>
          </div>
          <div className="flex flex-col">
            {pairs.map((p) => {
              const down = p.changeTone === "down";
              return (
                <div
                  key={p.id}
                  className="flex items-center border-b border-slate-200 px-6 py-3.5"
                >
                  <span className="flex-1 text-[13px] font-bold text-slate-900">
                    {p.base} <I18nText i18nKey="ui.15ynnjp" source="→" />{p.quote}
                  </span>
                  <span className="w-[120px] text-right font-mono text-[13px] text-slate-600">
                    {fmtRate(p.rate)}
                  </span>
                  <span className="w-[120px] text-right font-mono text-[13px] font-semibold text-slate-900">
                    {fmtRate(p.rate)}
                  </span>
                  <span className="w-[90px] text-right font-mono text-[13px] text-slate-600">
                    {p.change ?? "—"}
                  </span>
                  <span
                    className={`w-[90px] text-right font-mono text-[13px] font-semibold ${
                      down ? "text-red-500" : "text-emerald-500"
                    }`}
                  >
                    {p.changeTone ?? "—"}
                  </span>
                  <div className="flex w-[90px] justify-end">
                    <Badge tone="success"><I18nText i18nKey="ui.11rknnz" source="Live" /></Badge>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
            <p className="text-[13px] text-slate-500">
              <I18nText i18nKey="ui.1j6rifw" source="Showing" />{pairs.length} <I18nText i18nKey="ui.t6uqnc" source="of" />{pairs.length} <I18nText i18nKey="ui.1xoyoqm" source="active pairs" /></p>
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

        {/* Markup configuration */}
        <div className="flex w-full shrink-0 flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 xl:w-[360px]">
          <h2 className="text-[15px] font-bold text-slate-900">
            <I18nText i18nKey="ui.10ay91j" source="Markup Configuration" /></h2>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500">
              <I18nText i18nKey="ui.wo6ncd" source="GLOBAL BASE MARKUP" /></label>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="font-mono text-lg font-bold text-slate-900">
                <I18nText i18nKey="ui.4s9bsz" source="—" /></span>
              <span className="text-[11px] text-slate-500"><I18nText i18nKey="ui.wt1sdt" source="applied to mid" /></span>
            </div>
          </div>

          <div className="w-full border-t border-slate-200" />

          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <p className="text-[13px] font-semibold text-slate-900">
                <I18nText i18nKey="ui.gem28o" source="Rate Source" /></p>
              <p className="text-[11px] text-slate-500"><I18nText i18nKey="ui.4tqh3i" source="Not configured" /></p>
            </div>
            <Badge tone="neutral"><I18nText i18nKey="ui.1kmy72x" source="Unknown" /></Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <p className="text-[13px] font-semibold text-slate-900">
                <I18nText i18nKey="ui.1qsq44e" source="Auto-sync" /></p>
              <p className="text-[11px] text-slate-500"><I18nText i18nKey="ui.4tqh3i" source="Not configured" /></p>
            </div>
            <Toggle defaultOn={false} aria-label="Auto-sync rates" data-i18n-aria-label={"[\"ui.1tgvc69\",\"Auto-sync rates\"]"} />
          </div>

          <button className="rounded-lg bg-slate-900 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-slate-800">
            <I18nText i18nKey="ui.1ft8q6j" source="Publish Rate Changes" /></button>
        </div>
      </div>
    </div>
  );
}
