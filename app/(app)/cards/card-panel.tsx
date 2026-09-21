"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Snowflake,
  Clock,
  Wifi,
  Eye,
  EyeOff,
  RotateCw,
  Copy,
  Check,
} from "lucide-react";
import { toggleCardFreeze, adjustCardLimit } from "@/app/actions/banking";
import { formatCurrency } from "@/lib/format";

type Card = {
  id: string;
  name: string;
  brand: string;
  number: string | null;
  last4: string;
  cvv: string | null;
  holder: string;
  expiry: string;
  spent: number;
  limit: number;
  frozen: boolean;
  type: string; // virtual | physical
  status: string; // active | pending | cancelled
};

/** "4111111111111111" -> "4111 1111 1111 1111" */
function groupNumber(n: string): string {
  return n.replace(/(.{4})/g, "$1 ").trim();
}

/** Flippable card. Front shows the number (revealable); back shows the CVV. */
function FlipCard({ card }: { card: Card }) {
  const pending = card.status === "pending";
  const canReveal = !pending && !!card.number;
  const [flipped, setFlipped] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const maskedNumber = card.number
    ? `•••• •••• •••• ${card.last4}`
    : "•••• •••• •••• ••••";

  async function copyNumber() {
    if (!card.number) return;
    try {
      await navigator.clipboard.writeText(card.number);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — ignore */
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="[perspective:1600px]">
        <div
          className={`relative h-[240px] w-full transition-transform duration-500 [transform-style:preserve-3d] ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* ---------- FRONT ---------- */}
          <div
            className={`absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl p-6 [backface-visibility:hidden] ${
              pending
                ? "bg-slate-400"
                : card.frozen
                  ? "bg-slate-700"
                  : "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700"
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

            {/* EMV chip + number */}
            <div className="flex flex-col gap-3">
              <div className="h-7 w-10 rounded-[5px] bg-gradient-to-br from-amber-200 to-amber-400 shadow-inner" />
              <div className="flex items-center gap-2">
                <p className="font-mono text-[19px] font-semibold tracking-[2px] text-white sm:text-[21px]">
                  {revealed && card.number
                    ? groupNumber(card.number)
                    : maskedNumber}
                </p>
                {revealed && card.number && (
                  <button
                    onClick={copyNumber}
                    className="text-white/60 transition-colors hover:text-white"
                    aria-label="Copy card number"
                  >
                    {copied ? (
                      <Check className="size-4 text-emerald-400" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </button>
                )}
              </div>
            </div>

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
              <p className="font-mono text-xs font-bold italic text-white/90">
                {card.brand}
              </p>
            </div>
          </div>

          {/* ---------- BACK ---------- */}
          <div className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div className="mt-5 h-11 w-full bg-black/80" />
            <div className="flex flex-col gap-2 px-6 pt-5">
              <p className="text-[10px] text-white/60">CVV</p>
              <div className="flex h-9 items-center justify-end rounded bg-white px-3">
                <span className="font-mono text-sm font-bold tracking-[2px] text-slate-900">
                  {revealed && card.cvv ? card.cvv : "•••"}
                </span>
              </div>
              <p className="mt-1 text-[10px] leading-relaxed text-white/50">
                Demo card — not connected to any card network. Numbers are
                randomly generated and cannot be charged.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card controls: reveal + flip (active cards only) */}
      {canReveal && (
        <div className="flex gap-2">
          <button
            onClick={() => setRevealed((v) => !v)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-semibold text-slate-800 transition-colors hover:bg-slate-50"
          >
            {revealed ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
            {revealed ? "Hide details" : "Show details"}
          </button>
          <button
            onClick={() => setFlipped((v) => !v)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-semibold text-slate-800 transition-colors hover:bg-slate-50"
          >
            <RotateCw className="size-4" />
            {flipped ? "Front" : "Flip for CVV"}
          </button>
        </div>
      )}
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
        <FlipCard card={card} />
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
      <FlipCard card={card} />

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
