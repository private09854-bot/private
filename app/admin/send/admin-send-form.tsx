"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, CheckCircle2, Send } from "lucide-react";
import { adminSendToUser } from "@/app/actions/admin";
import { formatCurrency, currencyFlag } from "@/lib/format";

type TargetUser = {
  id: string;
  name: string;
  handle: string | null;
  email: string;
  avatar: string | null;
};
type TreasuryWallet = { currency: string; symbol: string; balance: number };

export default function AdminSendForm({
  users,
  wallets,
}: {
  users: TargetUser[];
  wallets: TreasuryWallet[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [targetId, setTargetId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(wallets[0]?.currency ?? "USD");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{
    ok?: boolean;
    error?: string;
    msg?: string;
  }>({});

  const wallet = wallets.find((w) => w.currency === currency) ?? null;
  const target = users.find((u) => u.id === targetId) ?? null;
  const amountNum = Number(amount) || 0;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        (u.handle ?? "").toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }, [users, query]);

  async function onSubmit() {
    setPending(true);
    setResult({});
    const res = await adminSendToUser({
      targetUserId: targetId,
      amount: amountNum,
      currency,
      note,
    });
    setPending(false);
    if (res.ok) {
      setResult({
        ok: true,
        msg: `Sent ${formatCurrency(amountNum, currency)} ${currency} to ${target?.name}.`,
      });
      router.refresh();
    } else {
      setResult({ error: res.error });
    }
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Left: form */}
      <div className="flex flex-1 flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        {/* Recipient picker */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-bold tracking-[0.5px] text-slate-500">
            RECIPIENT ACCOUNT
          </label>
          <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3">
            <Search className="size-[18px] shrink-0 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any user by name, handle or email..."
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none"
            />
          </div>
          <div className="flex max-h-[260px] flex-col gap-2 overflow-y-auto">
            {filtered.map((u) => (
              <button
                key={u.id}
                onClick={() => setTargetId(u.id)}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                  u.id === targetId
                    ? "border-amber-500 bg-amber-100/40"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={u.avatar ?? "/avatars/sarah.png"}
                  alt={u.name}
                  className="size-9 shrink-0 rounded-full object-cover"
                />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="truncate text-[13px] font-semibold text-slate-900">
                    {u.name}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {u.handle ?? u.email}
                  </p>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="py-4 text-center text-[13px] text-slate-500">
                No users match your search.
              </p>
            )}
          </div>
        </div>

        {/* Amount + currency */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold tracking-[0.5px] text-slate-500">
            DISBURSEMENT AMOUNT
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
                className="w-[200px] bg-transparent font-mono text-[28px] font-bold text-slate-900 focus:outline-none"
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
                aria-label="Currency"
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
            Treasury balance:{" "}
            <span className="font-semibold text-slate-900">
              {formatCurrency(wallet?.balance ?? 0, currency)} {currency}
            </span>
          </p>
        </div>

        {/* Note */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold tracking-[0.5px] text-slate-500">
            REFERENCE / NOTE (OPTIONAL)
          </label>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a reference or note"
              className="w-full bg-transparent text-[13px] text-slate-600 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Right: summary + action */}
      <div className="flex w-full shrink-0 flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 lg:w-[380px]">
        <h2 className="text-base font-bold text-slate-900">Transfer Summary</h2>
        <div className="flex flex-col gap-4 text-[13px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Recipient</span>
            <span className="font-semibold text-slate-900">
              {target?.name ?? "—"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Amount</span>
            <span className="font-mono font-bold text-slate-900">
              {formatCurrency(amountNum, currency)} {currency}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Fee</span>
            <span className="font-mono font-bold text-slate-900">
              Not configured
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Delivery</span>
            <span className="font-semibold text-slate-900">Not configured</span>
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
            {result.msg}
          </div>
        )}

        <button
          onClick={onSubmit}
          disabled={pending || !target || amountNum <= 0}
          className="flex items-center justify-center gap-2 rounded-[10px] bg-amber-500 p-4 text-[15px] font-bold text-white transition-colors hover:bg-amber-600 disabled:opacity-60"
        >
          <Send className="size-4" />
          {pending
            ? "Sending…"
            : `Send ${formatCurrency(amountNum, currency)} ${currency}`}
        </button>

        <p className="text-[11px] leading-relaxed text-slate-400">
          Admin-only disbursement. Funds move from the platform treasury into
          the selected user&apos;s wallet and appear instantly in their account.
        </p>
      </div>
    </div>
  );
}
