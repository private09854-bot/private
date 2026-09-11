import Link from "next/link";
import {
  ChevronDown,
  Send,
  ArrowDown,
  ArrowLeftRight,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Info,
  type LucideIcon,
} from "lucide-react";
import Badge from "@/components/ui/badge";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireCustomer } from "@/lib/session";
import { usdRateMap, portfolioUsd } from "@/lib/data";
import { formatCurrency, formatNumber, currencyFlag } from "@/lib/format";

const actions: {
  label: string;
  icon: LucideIcon;
  href: string;
  primary?: boolean;
}[] = [
  { label: "Send Funds", icon: Send, href: "/send", primary: true },
  { label: "Receive", icon: ArrowDown, href: "/wallets" },
  { label: "Convert Rate", icon: ArrowLeftRight, href: "/convert" },
  { label: "Add Money", icon: Plus, href: "/wallets" },
];

function activityIcon(kind: string, amount: number): LucideIcon {
  if (kind === "convert") return RefreshCw;
  return amount < 0 ? ArrowUpRight : ArrowDownLeft;
}

function activityTitle(kind: string, title: string, amount: number): string {
  if (kind === "convert") return title;
  return amount < 0 ? `Sent to ${title}` : `Received from ${title}`;
}

const badgeTone: Record<string, "success" | "warning" | "danger"> = {
  Completed: "success",
  Pending: "warning",
  Processing: "warning",
  Failed: "danger",
};

const INDEX_PAIRS: [string, string][] = [
  ["USD", "EUR"],
  ["USD", "GBP"],
  ["EUR", "GBP"],
  ["USD", "CAD"],
];

export default async function DashboardPage() {
  const user = await requireCustomer();

  const [walletsRes, rates, txRes, fxRes] = await Promise.all([
    supabaseAdmin.from("wallets").select("*").eq("ownerId", user.id).order("sort"),
    usdRateMap(),
    supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("ownerId", user.id)
      .order("date", { ascending: false })
      .limit(5),
    supabaseAdmin.from("fx_rates").select("*"),
  ]);

  const wallets = walletsRes.data ?? [];
  const transactions = txRes.data ?? [];
  const fx = fxRes.data ?? [];

  const portfolio = portfolioUsd(wallets, rates);
  const fxLookup = new Map(fx.map((r) => [`${r.base}/${r.quote}`, r]));

  return (
    <div className="flex flex-col gap-8">
      {/* Greeting + base currency */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-bold tracking-[-0.5px] text-slate-900">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-slate-600">
            Institutional fintech portal • Account Active • Verified
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2">
          <span className="font-mono text-xs font-bold text-slate-900">
            BASE: USD
          </span>
          <ChevronDown className="size-3 text-slate-900" />
        </button>
      </div>

      {/* Total portfolio */}
      <div className="flex flex-col gap-2 rounded-2xl bg-slate-900 p-7">
        <p className="text-[13px] font-semibold uppercase text-slate-500">
          Total Consolidated Portfolio Value
        </p>
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[40px] font-extrabold text-white">
            {formatCurrency(portfolio, "USD")}
          </span>
          <span className="text-xl font-semibold text-emerald-500">USD</span>
        </div>
      </div>

      {/* Currencies */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {wallets.map((c) => (
          <div
            key={c.currency}
            className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-[18px]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-base leading-none">
                  {currencyFlag(c.currency)}
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {c.currency}
                </span>
              </div>
              <span
                className={`text-[11px] font-semibold ${
                  c.changeTone === "down" ? "text-red-500" : "text-emerald-500"
                }`}
              >
                {c.changeLabel}
              </span>
            </div>
            <p className="font-mono text-lg font-bold text-slate-900">
              {formatCurrency(c.balance, c.currency)}
            </p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        {actions.map(({ label, icon: Icon, href, primary }) => (
          <Link
            key={label}
            href={href}
            className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-colors ${
              primary
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "border border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </div>

      {/* Split: recent activity + conversion indices */}
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Recent Activity
            </h2>
            <Link
              href="/transactions"
              className="text-[13px] font-semibold text-emerald-500 hover:text-emerald-600"
            >
              View Audit Trail
            </Link>
          </div>
          <div className="flex flex-col">
            {transactions.map((t) => {
              const Icon = activityIcon(t.kind, t.amount);
              const positive = t.amount > 0;
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between border-b border-slate-200 px-4 py-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-slate-50">
                      <Icon className="size-3.5 text-slate-700" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {activityTitle(t.kind, t.title, t.amount)}
                      </p>
                      <p className="truncate text-xs text-slate-500">{t.sub}</p>
                    </div>
                  </div>
                  <p
                    className={`w-[120px] shrink-0 pl-2 text-right font-mono text-sm font-bold ${
                      positive ? "text-emerald-500" : "text-slate-900"
                    }`}
                  >
                    {formatCurrency(t.amount, t.currency, { sign: true })}{" "}
                    {t.currency}
                  </p>
                  <p className="hidden w-[120px] shrink-0 text-right text-[13px] text-slate-600 sm:block">
                    {new Date(t.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <div className="flex w-[80px] shrink-0 justify-center">
                    <Badge tone={badgeTone[t.status] ?? "neutral"} className="w-[90px]">
                      {t.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex w-full flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 lg:w-[340px]">
          <h2 className="text-[15px] font-bold text-slate-900">
            Conversion Indices
          </h2>
          <div className="flex flex-col gap-3.5">
            {INDEX_PAIRS.map(([base, quote]) => {
              const r = fxLookup.get(`${base}/${quote}`);
              if (!r) return null;
              return (
                <div
                  key={`${base}/${quote}`}
                  className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                >
                  <span className="text-[13px] font-semibold text-slate-900">
                    {base} / {quote}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[13px] font-bold text-slate-900">
                      {formatNumber(r.rate, 4)}
                    </span>
                    <span
                      className={`text-[11px] font-semibold ${
                        r.changeTone === "down"
                          ? "text-red-500"
                          : "text-emerald-500"
                      }`}
                    >
                      {r.change}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-start gap-2.5 rounded-lg bg-emerald-50 p-3">
            <Info className="size-4 shrink-0 text-emerald-500" />
            <p className="text-[11px] text-emerald-500">
              Conversion rates are direct mid-market values without
              institutional markup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
