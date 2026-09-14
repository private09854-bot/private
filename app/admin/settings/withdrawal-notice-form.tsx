"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { updateWithdrawalNotice } from "@/app/actions/admin";

export default function WithdrawalNoticeForm({
  initial,
}: {
  initial: { title: string; body: string };
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const dirty = title !== initial.title || body !== initial.body;

  function save() {
    setError("");
    setSaved(false);
    startTransition(async () => {
      const res = await updateWithdrawalNotice({ title, body });
      if (res.error) {
        setError(res.error);
        return;
      }
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="notice-title"
          className="text-[13px] font-semibold text-slate-900"
        >
          Heading
        </label>
        <input
          id="notice-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
          className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="notice-body"
          className="text-[13px] font-semibold text-slate-900"
        >
          Message
        </label>
        <textarea
          id="notice-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          maxLength={2000}
          className="resize-y rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <p className="text-[11px] text-slate-500">
          Type{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-slate-700">
            {"{method}"}
          </code>{" "}
          where you want the payout method’s name (PayPal, Wise…) to appear.
        </p>
      </div>

      {/* Live preview of what the customer sees */}
      <div className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-amber-600">
          Customer sees
        </p>
        <p className="text-sm font-bold text-slate-900">
          {title || "Withdrawals unavailable"}
        </p>
        <p className="whitespace-pre-line text-[13px] leading-relaxed text-slate-700">
          {(body || "").replace(/{method}/g, "PayPal")}
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-[13px] font-semibold text-red-600">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={pending || !dirty}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending && <Loader2 className="size-3.5 animate-spin" />}
          {pending ? "Saving…" : "Save message"}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-[13px] font-semibold text-emerald-600">
            <CheckCircle2 className="size-4" />
            Saved — customers see it now
          </span>
        )}
        {dirty && !pending && !saved && (
          <span className="text-[13px] text-slate-500">Unsaved changes</span>
        )}
      </div>
    </div>
  );
}
