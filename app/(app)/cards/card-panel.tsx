"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Snowflake, Clock, Wifi } from "lucide-react";
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
  type: string; // virtual | physical
  status: string; // active | pending | cancelled
};

/** The card face — shared look for active and pending cards. */
function CardFace({ card }: { card: Card }) {
  const pending = card.status === "pending";
  return (
    <div
      className={`relative flex h-[240px] flex-col justify-between overflow-hidden rounded-2xl p-6 transition-colors ${
        pending
          ? "bg-slate-400"
          : card.frozen
            ? "bg-slate-700"
            : "bg-gradient-to-br from-slate-900 to-slate-700"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-lg font-bold text-white">{card.name}</p>
          <span className="w-fit rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            {card.type}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {pending && (
            <span className="flex items-center gap-1 rounded-full bg-amber-400/25 px-2 py-0.5 text-[10px] font-bold text-amber-100">
              <Clock className="size-3" />
              PENDING
            </span>
          )}
          {!pending && card.frozen && (
            <span className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300">
              <Snowflake className="size-3" />
              FROZEN
            </span>
          )}
          {!pending && <Wifi className="size-4 rotate-90 text-white/70" />}
        </div>
      </div>

      <p className="font-mono text-[22px] font-semibold tracking-[2px] text-white">
        {pending ? "•••• •••• •••• ••••" : `•••• •••• •••• ${card.last4}`}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <p className="text-[10px] text-white/60">CARD HOLDER</p>
          <p className="text-sm font-semibold text-white">{card.holder}</p>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-[10px] text-white/60">EXPIRES</p>
          <p className="font-mono text-sm font-semibold text-white">
            {pending ? "••/••" : card.expiry}
          </p>
        </div>
        <p className="font-mono text-xs font-bold text-white/90">{card.brand}</p>
      </div>
    </div>
  );
}

export default function CardPanel({ card }: { card: Card }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [limit, setLimit] = useState(String(card.limit));
  const [pending, startTransition] = useTransition();

  const pct = card.limit
    ? Math.min(100, Math.round((card.spent / card.limit) * 100))
    : 0;

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

  // Pending physical card: show the face + a status note, no controls.
  if (card.status === "pending") {
    return (
      <div className="flex w-full flex-col gap-4">
        <CardFace card={card} />
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <Clock className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <div className="flex flex-col gap-0.5">
            <p className="text-[13px] font-bold text-amber-900">
              Your physical card is being prepared
            </p>
            <p className="text-[12px] leading-relaxed text-amber-800">
              We&apos;re processing your request. You&apos;ll be able to activate
              the card once it arrives.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <CardFace card={card} />

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
