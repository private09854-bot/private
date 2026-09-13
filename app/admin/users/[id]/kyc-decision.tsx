"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { approveKyc, rejectKyc } from "@/app/actions/admin";

export default function KycDecision({
  appId,
  status,
}: {
  appId: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [asking, setAsking] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const settled = status === "approved" || status === "rejected";

  function run(fn: () => Promise<{ error?: string }>) {
    setError("");
    startTransition(async () => {
      const res = await fn();
      if (res.error) setError(res.error);
      else {
        setAsking(false);
        setReason("");
        router.refresh();
      }
    });
  }

  if (settled) {
    return (
      <button
        onClick={() => run(() => approveKyc(appId))}
        disabled={pending || status === "approved"}
        className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-900 transition-colors hover:bg-slate-50 disabled:opacity-40"
      >
        {status === "approved" ? "Approved" : "Approve instead"}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {asking ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason shown to the customer"
            className="rounded-lg border border-slate-200 px-3 py-2 text-[13px] focus:border-red-400 focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => run(() => rejectKyc(appId, reason))}
              disabled={pending}
              className="rounded-lg bg-red-600 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {pending ? "…" : "Confirm reject"}
            </button>
            <button
              onClick={() => setAsking(false)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-[13px] font-semibold text-slate-600"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => run(() => approveKyc(appId))}
            disabled={pending}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            <Check className="size-3.5" />
            {pending ? "Working…" : "Approve"}
          </button>
          <button
            onClick={() => setAsking(true)}
            disabled={pending}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-900 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <X className="size-3.5" />
            Reject
          </button>
        </div>
      )}
      {error && <p className="text-[11px] font-semibold text-red-600">{error}</p>}
    </div>
  );
}
