"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Snowflake } from "lucide-react";
import { toggleCardFreeze, adjustCardLimit } from "@/app/actions/banking";
import { formatCurrency } from "@/lib/format";

type Card = {
  id: string;
  name: string;
  brand: string;
  last4: string;
  holder: string;
  expiry: string;
  spent: number;
  limit: number;
  frozen: boolean;
};

export default function CardPanel({ card }: { card: Card }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [limit, setLimit] = useState(String(card.limit));
  const [pending, startTransition] = useTransition();

  const pct = Math.min(100, Math.round((card.spent / card.limit) * 100));

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function onFreeze() {
    await toggleCardFreeze(card.id);
    refresh();
  }

  async function onSaveLimit() {
    await adjustCardLimit(card.id, Number(limit));
    setEditing(false);
    refresh();
  }

  return (
    <div className="flex w-full shrink-0 flex-col gap-5 lg:w-[420px]">
      {/* Card */}
      <div
        className={`flex h-[240px] flex-col justify-between rounded-2xl p-6 transition-colors ${
          card.frozen ? "bg-slate-700" : "bg-slate-900"
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-white">{card.name}</p>
          <div className="flex items-center gap-2">
            {card.frozen && (
              <span className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                <Snowflake className="size-3" />
                FROZEN
              </span>
            )}
            <p className="font-mono text-xs text-emerald-500">{card.brand}</p>
          </div>
        </div>
        <p className="font-mono text-[22px] font-semibold tracking-[2px] text-white">
          •••• •••• •••• {card.last4}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <p className="text-[10px] text-slate-500">CARD HOLDER</p>
            <p className="text-sm font-semibold text-white">{card.holder}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-[10px] text-slate-500">EXPIRES</p>
            <p className="font-mono text-sm font-semibold text-white">
              {card.expiry}
            </p>
          </div>
        </div>
      </div>

      {/* Limit tracker */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_6px_rgba(15,23,42,0.03)]">
        <p className="text-base font-semibold text-slate-900">
          Monthly Spend Progress
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[13px] text-slate-500">
            <p>Spent: {formatCurrency(card.spent, "USD")}</p>
            <p>Limit: {formatCurrency(card.limit, "USD")}</p>
          </div>
          <div className="flex h-2 w-full overflow-hidden rounded bg-slate-50">
            <div
              className="h-full rounded bg-emerald-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {editing && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              step="100"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
            <button
              onClick={onSaveLimit}
              disabled={pending}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-emerald-600 disabled:opacity-60"
            >
              Save
            </button>
          </div>
        )}

        <div className="w-full border-t border-slate-200" />
        <div className="flex gap-3">
          <button
            onClick={onFreeze}
            disabled={pending}
            className={`flex flex-1 items-center justify-center rounded-lg border px-4 py-2 text-[13px] transition-colors disabled:opacity-60 ${
              card.frozen
                ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                : "border-slate-200 text-red-500 hover:bg-red-50"
            }`}
          >
            {card.frozen ? "Unfreeze Card" : "Freeze Card"}
          </button>
          <button
            onClick={() => setEditing((v) => !v)}
            className="flex flex-1 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-[13px] text-slate-900 transition-colors hover:bg-slate-100"
          >
            {editing ? "Close" : "Adjust Limit"}
          </button>
        </div>
      </div>
    </div>
  );
}
