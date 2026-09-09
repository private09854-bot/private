"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ArrowLeftRight, CheckCircle2 } from "lucide-react";
import { convertMoney } from "@/app/actions/banking";
import { formatCurrency, formatNumber, currencyFlag } from "@/lib/format";

type Wallet = {
  currency: string;
  symbol: string;
  balance: number;
  available: number | null;
};

const FEE_RATE = 0.0025;

function CurrencySelect({
  value,
  onChange,
  wallets,
}: {
  value: string;
  onChange: (v: string) => void;
  wallets: Wallet[];
}) {
  return (
    <div className="relative flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5">
      <span className="text-sm font-bold text-slate-900">
        {currencyFlag(value)} {value}
      </span>
      <ChevronDown className="size-2.5 text-slate-900" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label="Currency"
      >
        {wallets.map((w) => (
          <option key={w.currency} value={w.currency}>
            {w.currency}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function ConvertForm({
  wallets,
  rates,
}: {
  wallets: Wallet[];
  rates: Record<string, number>;
}) {
  const router = useRouter();
  const [from, setFrom] = useState(wallets[0]?.currency ?? "USD");
  const [to, setTo] = useState(
    wallets.find((w) => w.currency !== (wallets[0]?.currency ?? "USD"))
      ?.currency ?? "EUR",
  );
  const [amount, setAmount] = useState("1000.00");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ ok?: boolean; error?: string }>({});

  const amountNum = Number(amount) || 0;
  const rate = rates[`${from}/${to}`] ?? null;
  const fromWallet = wallets.find((w) => w.currency === from) ?? null;
  const toWallet = wallets.find((w) => w.currency === to) ?? null;

  const fee = amountNum * FEE_RATE;
  const net = amountNum - fee;
  const grossReceive = rate != null ? amountNum * rate : 0;
  const netReceive = rate != null ? net * rate : 0;

  function swap() {
    setFrom(to);
    setTo(from);
  }

  async function onConvert() {
    setPending(true);
    setResult({});
    const res = await convertMoney({ from, to, amount: amountNum });
    setPending(false);
    setResult(res);
    if (res.ok) router.refresh();
  }

  const providers = [
    { provider: "Vault (Us)", rate: rate ?? 0, fee: fee, tag: "Best Rate", best: true },
    { provider: "Typical Bank", rate: (rate ?? 0) * 0.96, fee: 15, tag: "Standard" },
    { provider: "Standard Swap", rate: (rate ?? 0) * 0.988, fee: 5, tag: "Standard" },
  ];

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      {/* Conversion form */}
      <div className="flex flex-1 flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
        {/* From */}
        <div className="flex flex-col gap-2.5">
          <p className="text-xs font-semibold text-slate-600">
            FROM SOURCE WALLET
          </p>
          <div className="flex items-center justify-between rounded-[10px] border border-slate-200 bg-slate-50 p-4">
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-[220px] bg-transparent font-mono text-[28px] font-bold text-slate-900 focus:outline-none"
            />
            <CurrencySelect value={from} onChange={setFrom} wallets={wallets} />
          </div>
          <p className="text-xs text-slate-500">
            Available Balance:{" "}
            {formatCurrency(fromWallet?.balance ?? 0, from)} {from}
          </p>
        </div>

        {/* Swap */}
        <div className="relative flex h-6 w-full items-center">
          <button
            onClick={swap}
            className="absolute -top-1 left-0 flex size-8 items-center justify-center rounded-2xl bg-slate-900 text-white transition-colors hover:bg-slate-800"
          >
            <ArrowLeftRight className="size-4" />
          </button>
        </div>

        {/* To */}
        <div className="flex flex-col gap-2.5">
          <p className="text-xs font-semibold text-slate-600">
            TO TARGET WALLET (ESTIMATED)
          </p>
          <div className="flex items-center justify-between rounded-[10px] border border-slate-200 bg-slate-50 p-4">
            <span className="font-mono text-[28px] font-bold text-slate-900">
              {formatNumber(grossReceive, 2)}
            </span>
            <CurrencySelect value={to} onChange={setTo} wallets={wallets} />
          </div>
          <p className="text-xs text-slate-500">
            Available Balance: {formatCurrency(toWallet?.balance ?? 0, to)} {to}
          </p>
        </div>

        <div className="w-full border-t border-slate-200" />

        {result.error && (
          <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-[13px] font-semibold text-red-500">
            {result.error}
          </p>
        )}
        {result.ok && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-[13px] font-semibold text-emerald-600">
            <CheckCircle2 className="size-4" />
            Conversion complete.
          </div>
        )}

        <button
          onClick={onConvert}
          disabled={pending || rate == null}
          className="flex items-center justify-center rounded-[10px] bg-emerald-500 p-4 text-[15px] font-bold text-white transition-colors hover:bg-emerald-600 disabled:opacity-60"
        >
          {pending
            ? "Converting…"
            : `Convert ${formatCurrency(amountNum, from)} ${from} to ${to}`}
        </button>
      </div>

      {/* Side panel */}
      <div className="flex w-full shrink-0 flex-col gap-6 lg:w-[400px]">
        {/* Live rate calculations */}
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-bold text-slate-900">
            Live Rate Calculations
          </p>
          <div className="flex flex-col gap-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">You convert</span>
              <span className="font-mono font-bold text-slate-900">
                {formatCurrency(amountNum, from)} {from}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Conversion Fee (0.25%)</span>
              <span className="font-mono font-bold text-slate-900">
                {formatCurrency(fee, from)} {from}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Net conversion amount</span>
              <span className="font-mono font-bold text-slate-900">
                {formatCurrency(net, from)} {from}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Calculated mid-market rate</span>
              <span className="font-mono font-bold text-slate-900">
                1 {from} = {rate != null ? formatNumber(rate, 4) : "—"} {to}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">You receive</span>
              <span className="font-mono font-bold text-slate-900">
                {formatCurrency(netReceive, to)} {to}
              </span>
            </div>
          </div>
          <div className="w-full border-t border-slate-200" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">Rate expires in</span>
            <span className="font-mono font-bold text-amber-500">0:58</span>
          </div>
        </div>

        {/* Sparkline */}
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-bold text-slate-900">
            24h {from}/{to} Sparkline Chart
          </p>
          <svg
            viewBox="0 0 352 80"
            className="h-20 w-full"
            preserveAspectRatio="none"
            fill="none"
          >
            <polyline
              points="0,60 40,50 70,63 110,44 150,53 190,34 230,43 270,24 310,30 352,11"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Comparisons */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-bold text-slate-900">
            How Our Rate Compares
          </p>
          <div className="flex justify-between border-b border-transparent pb-1 text-[11px] font-semibold text-slate-500">
            <span className="w-[120px]">PROVIDER</span>
            <span className="w-[100px]">RATE</span>
            <span className="w-[80px]">FEE</span>
            <span className="text-right">SAVINGS</span>
          </div>
          <div className="flex flex-col">
            {providers.map((r) => (
              <div
                key={r.provider}
                className={`flex items-center justify-between px-4 py-3 ${
                  r.best
                    ? "rounded-lg border border-emerald-500 bg-emerald-50"
                    : "border-b border-slate-200"
                }`}
              >
                <span
                  className={`w-[120px] text-sm ${
                    r.best
                      ? "font-bold text-slate-900"
                      : "font-medium text-slate-900"
                  }`}
                >
                  {r.provider}
                </span>
                <span className="w-[100px] font-mono text-sm font-semibold text-slate-900">
                  {formatNumber(r.rate, 4)}
                </span>
                <span className="w-[80px] text-sm text-slate-600">
                  {formatCurrency(r.fee, from)}
                </span>
                <span
                  className={`text-right text-xs font-bold ${
                    r.best ? "text-emerald-500" : "text-slate-500"
                  }`}
                >
                  {r.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
