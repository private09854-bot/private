"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Truck, Loader2, Plus } from "lucide-react";
import { createVirtualCard, requestPhysicalCard } from "@/app/actions/banking";

export default function IssueCards({
  hasVirtual,
  hasPhysical,
}: {
  hasVirtual: boolean;
  hasPhysical: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<"virtual" | "physical" | null>(null);
  const [error, setError] = useState("");

  if (hasVirtual && hasPhysical) return null;

  function run(kind: "virtual" | "physical") {
    setError("");
    setBusy(kind);
    startTransition(async () => {
      const res =
        kind === "virtual"
          ? await createVirtualCard()
          : await requestPhysicalCard();
      setBusy(null);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6">
      <p className="text-base font-semibold text-slate-900">Add a card</p>

      {!hasVirtual && (
        <button
          onClick={() => run("virtual")}
          disabled={pending}
          className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition-colors hover:border-emerald-300 hover:bg-emerald-50/40 disabled:opacity-60"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            {busy === "virtual" ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <CreditCard className="size-5" />
            )}
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm font-bold text-slate-900">
              Create a virtual card
            </span>
            <span className="text-[12px] text-slate-500">
              Issued instantly in your name — use it online right away.
            </span>
          </span>
          <Plus className="size-4 shrink-0 text-slate-400" />
        </button>
      )}

      {!hasPhysical && (
        <button
          onClick={() => run("physical")}
          disabled={pending}
          className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            {busy === "physical" ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Truck className="size-5" />
            )}
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm font-bold text-slate-900">
              Request a physical card
            </span>
            <span className="text-[12px] text-slate-500">
              Shipped to your address — shows as pending until it arrives.
            </span>
          </span>
          <Plus className="size-4 shrink-0 text-slate-400" />
        </button>
      )}

      {error && (
        <p className="text-[12px] font-semibold text-red-500">{error}</p>
      )}
    </div>
  );
}
