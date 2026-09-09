"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { User, ChevronDown, CheckCircle2 } from "lucide-react";
import { sendMoney } from "@/app/actions/banking";
import { formatCurrency, currencyFlag } from "@/lib/format";

type Recipient = {
  id: string;
  name: string;
  handle: string | null;
  avatar: string | null;
};
type Wallet = {
  currency: string;
  symbol: string;
  balance: number;
  available: number | null;
};

export default function SendForm({
  recipients,
  wallets,
}: {
  recipients: Recipient[];
  wallets: Wallet[];
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(recipients[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [amount, setAmount] = useState("500.00");
  const [currency, setCurrency] = useState(wallets[0]?.currency ?? "USD");
  const [note, setNote] = useState("Invoice #4928 - Project design deliverables");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ ok?: boolean; error?: string }>({});

  const selected = recipients.find((r) => r.id === selectedId) ?? null;
  const wallet = wallets.find((w) => w.currency === currency) ?? null;
  const amountNum = Number(amount) || 0;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? recipients.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            (r.handle ?? "").toLowerCase().includes(q),
        )
      : recipients;
    return base.slice(0, 3);
  }, [query, recipients]);

  async function onSubmit() {
    setPending(true);
    setResult({});
    const res = await sendMoney({
      recipientId: selectedId,
      amount: amountNum,
      currency,
      note,
    });
    setPending(false);
    setResult(res);
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      {/* Form card */}
      <div className="flex flex-1 flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
        {/* Recipient search */}
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-semibold text-slate-600">
            RECIPIENT VAULT PROFILE
          </label>
          <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3.5">
            <User className="size-[18px] shrink-0 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, or username..."
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Recent recipients */}
        <div className="flex flex-col gap-2.5">
          <p className="text-xs font-semibold text-slate-500">
            RECENT RECIPIENTS
          </p>
          <div className="flex flex-wrap gap-2.5">
            {filtered.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={`flex items-center gap-2.5 rounded-[30px] border py-2 pl-3 pr-4 transition-colors ${
                  r.id === selectedId
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.avatar ?? "/avatars/sarah.png"}
                  alt={r.name}
                  className="size-6 rounded-full object-cover"
                />
                <span className="flex flex-col items-start">
                  <span className="text-xs font-semibold text-slate-900">
                    {r.name}
                  </span>
                  <span className="text-[11px] text-slate-500">{r.handle}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected recipient */}
        {selected && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-500 bg-emerald-50 p-4">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selected.avatar ?? "/avatars/sarah.png"}
                alt={selected.name}
                className="size-10 rounded-full object-cover"
              />
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-bold text-slate-900">
                  {selected.name}
                </p>
                <p className="text-xs text-slate-500">{selected.handle}</p>
              </div>
            </div>
            <span className="text-[13px] font-semibold text-emerald-500">
              Selected
            </span>
          </div>
        )}

        {/* Amount */}
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-semibold text-slate-600">
            SEND AMOUNT
          </label>
          <div className="flex items-center justify-between rounded-[10px] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-[28px] font-bold text-slate-900">
                {wallet?.symbol ?? "$"}
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-[180px] bg-transparent font-mono text-[28px] font-bold text-slate-900 focus:outline-none"
              />
            </div>
            <div className="relative flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5">
              <span className="text-sm font-bold text-slate-900">
                {currencyFlag(currency)} {currency}
              </span>
              <ChevronDown className="size-2.5 text-slate-900" />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label="Send currency"
              >
                {wallets.map((w) => (
                  <option key={w.currency} value={w.currency}>
                    {w.currency}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Available Balance:{" "}
            {formatCurrency(wallet?.available ?? wallet?.balance ?? 0, currency)}{" "}
            {currency}
          </p>
        </div>

        {/* Memo */}
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-semibold text-slate-600">
            REFERENCE / NOTE (OPTIONAL)
          </label>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-transparent text-[13px] text-slate-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Summary panel */}
      <div className="flex w-full shrink-0 flex-col gap-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 lg:w-[400px]">
        <h2 className="text-base font-bold text-slate-900">Transfer Summary</h2>
        <div className="flex flex-col gap-4 text-[13px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">You send</span>
            <span className="font-mono font-bold text-slate-900">
              {formatCurrency(amountNum, currency)} {currency}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Transfer fee</span>
            <span className="font-mono font-bold text-slate-900">
              {formatCurrency(0, currency)} {currency} (Platform Free)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">
              {selected?.name.split(" ")[0] ?? "Recipient"} receives
            </span>
            <span className="font-mono font-bold text-slate-900">
              {formatCurrency(amountNum, currency)} {currency}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Delivery window</span>
            <span className="font-mono font-bold text-slate-900">
              Instantaneous
            </span>
          </div>
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
            Transfer sent successfully.
          </div>
        )}

        <button
          onClick={onSubmit}
          disabled={pending || !selected}
          className="flex items-center justify-center rounded-[10px] bg-emerald-500 p-4 text-[15px] font-bold text-white transition-colors hover:bg-emerald-600 disabled:opacity-60"
        >
          {pending
            ? "Sending…"
            : `Send ${formatCurrency(amountNum, currency)} ${currency}`}
        </button>
      </div>
    </div>
  );
}
