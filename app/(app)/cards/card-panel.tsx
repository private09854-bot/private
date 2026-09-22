"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Snowflake,
  Clock,
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

/** EMV-style chip — an original gold chip graphic, not a flat rectangle. */
function CardChip() {
  return (
    <svg viewBox="0 0 48 38" className="h-9 w-12" aria-hidden="true">
      <defs>
        <linearGradient id="chipg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F7E6A8" />
          <stop offset="0.5" stopColor="#E7C766" />
          <stop offset="1" stopColor="#B8912F" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="36" rx="6" fill="url(#chipg)" />
      <g stroke="#8a6d1e" strokeWidth="1.1" fill="none" opacity="0.65">
        <path d="M17 1 V37 M31 1 V37 M1 13 H17 M31 13 H47 M1 25 H17 M31 25 H47" />
        <rect x="17" y="13" width="14" height="12" rx="1.5" />
      </g>
    </svg>
  );
}

/** Contactless payment waves. */
function Contactless({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M8.5 7.5a7 7 0 0 1 0 9" />
      <path d="M12 5a10 10 0 0 1 0 14" />
      <path d="M15.5 3a13 13 0 0 1 0 18" />
    </svg>
  );
}

/** Flippable card. Front shows the number (revealable); back shows the CVV. */
function FlipCard({ card }: { card: Card }) {
  const pending = card.status === "pending";
  const canReveal = !pending && !!card.number;
  const [flipped, setFlipped] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  // A card that has not been issued (pending) shows no digits at all, so there
  // is never a stray last-4 that looks like it should match another card.
  const maskedNumber =
    pending || !card.number
      ? "•••• •••• •••• ••••"
      : `•••• •••• •••• ${card.last4}`;

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
            className={`absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl p-6 text-white [backface-visibility:hidden] ${
              pending
                ? "bg-[linear-gradient(135deg,#64748b_0%,#475569_100%)]"
                : card.frozen
                  ? "bg-[linear-gradient(135deg,#475569_0%,#334155_100%)]"
                  : "bg-[linear-gradient(135deg,#0b3b2e_0%,#0f172a_52%,#134e4a_100%)]"
            }`}
          >
            {/* Background depth: soft brand-gold glow + translucent rings */}
            <div className="pointer-events-none absolute -right-16 -top-24 size-56 rounded-full bg-emerald-400/10 blur-2xl" />
            <div className="pointer-events-none absolute -right-8 -top-10 size-40 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -bottom-24 -left-12 size-56 rounded-full border border-white/10" />

            <div className="relative flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-[15px] font-bold tracking-wide">{card.name}</p>
                <span className="w-fit rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/90">
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
                  <span className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-200">
                    <Snowflake className="size-3" />
                    FROZEN
                  </span>
                )}
              </div>
            </div>

            {/* Chip + contactless + number */}
            <div className="relative flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <CardChip />
                {!pending && <Contactless className="size-5 text-white/75" />}
              </div>
              <div className="flex items-center gap-2">
                <p className="font-mono text-[19px] font-semibold tracking-[2px] [text-shadow:0_1px_2px_rgba(0,0,0,0.35)] sm:text-[21px]">
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
                      <Check className="size-4 text-emerald-300" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="relative flex items-end justify-between">
              <div className="flex flex-col gap-0.5">
                <p className="text-[9px] uppercase tracking-wider text-white/55">
                  Card Holder
                </p>
                <p className="text-sm font-semibold tracking-wide">
                  {card.holder}
                </p>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-[9px] uppercase tracking-wider text-white/55">
                  Expires
                </p>
                <p className="font-mono text-sm font-semibold">
                  {pending ? "••/••" : card.expiry}
                </p>
              </div>
              <p className="font-serif text-lg font-bold italic tracking-tight text-white/95">
                {card.brand}
              </p>
            </div>
          </div>

          {/* ---------- BACK ---------- */}
          <div className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#134e4a_100%)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div className="mt-5 h-11 w-full bg-black/85" />
            <div className="flex flex-col gap-2 px-6 pt-5">
              <p className="text-[10px] uppercase tracking-wider text-white/55">
                CVV
              </p>
              <div className="flex h-9 items-center justify-end rounded bg-[repeating-linear-gradient(-60deg,#fff,#fff_6px,#eef2f7_6px,#eef2f7_12px)] px-3">
                <span className="font-mono text-sm font-bold tracking-[2px] text-slate-900">
                  {revealed && card.cvv ? card.cvv : "•••"}
                </span>
              </div>
              <div className="mt-auto flex items-center justify-between pb-5 pt-3">
                <span className="font-serif text-base font-bold italic text-white/90">
                  {card.brand}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-white/50">
                  Profintal Savings
                </span>
              </div>
              <p className="text-[10px] leading-relaxed text-white/45">
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
