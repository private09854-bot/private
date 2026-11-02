"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { approveKyc, rejectKyc } from "@/app/actions/admin";
import { I18nText } from "@/components/i18n-text";

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
        {status === "approved" ? <I18nText i18nKey="ui.1j3qly2" source="Approved" /> : <I18nText i18nKey="ui.1ih6buc" source="Approve instead" />}
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
            placeholder="Reason shown to the customer" data-i18n-placeholder={"[\"ui.1hsv956\",\"Reason shown to the customer\"]"}
            className="rounded-lg border border-slate-200 px-3 py-2 text-[13px] focus:border-red-400 focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => run(() => rejectKyc(appId, reason))}
              disabled={pending}
              className="rounded-lg bg-red-600 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {pending ? <I18nText i18nKey="ui.9s26ah" source="…" /> : <I18nText i18nKey="ui.1mt9kum" source="Confirm reject" />}
            </button>
            <button
              onClick={() => setAsking(false)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-[13px] font-semibold text-slate-600"
            >
              <I18nText i18nKey="ui.ew9em3" source="Cancel" /></button>
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
            {pending ? <I18nText i18nKey="ui.1hfa4bu" source="Working…" /> : <I18nText i18nKey="ui.1s2ov2y" source="Approve" />}
          </button>
          <button
            onClick={() => setAsking(true)}
            disabled={pending}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-900 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <X className="size-3.5" />
            <I18nText i18nKey="ui.1kej36u" source="Reject" /></button>
        </div>
      )}
      {error && <p className="text-[11px] font-semibold text-red-600">{error}</p>}
    </div>
  );
}
