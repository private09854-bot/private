"use client";

import { useState } from "react";
import { MessageCircle, X, Send, CheckCircle2 } from "lucide-react";
import { sendSupportMessage } from "@/app/actions/support";

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function onSend() {
    if (!message.trim()) return;
    setPending(true);
    setError("");
    const res = await sendSupportMessage({ message });
    setPending(false);
    if (res.ok) {
      setSent(true);
      setMessage("");
    } else {
      setError(res.error ?? "Could not send. Try again.");
    }
  }

  return (
    <>
      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex w-[340px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.18)]">
          <div className="flex items-center justify-between bg-blue-600 px-4 py-3.5">
            <div className="flex flex-col">
              <p className="text-sm font-bold text-white">Support</p>
              <p className="text-[11px] text-blue-100">
                Typically replies within a few hours
              </p>
            </div>
            <button
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="text-blue-100 transition-colors hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3 p-4">
            {sent ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <CheckCircle2 className="size-8 text-emerald-500" />
                <p className="text-sm font-semibold text-slate-900">
                  Message sent
                </p>
                <p className="text-[13px] text-slate-500">
                  Our team has been notified and will get back to you by email.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-1 text-[13px] font-semibold text-blue-600 hover:text-blue-700"
                >
                  Send another
                </button>
              </div>
            ) : (
              <>
                <div className="rounded-xl bg-slate-50 p-3 text-[13px] text-slate-600">
                  👋 Hi! How can we help you today? Leave a message and we&apos;ll
                  reply by email.
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Type your message…"
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {error && (
                  <p className="text-[12px] font-semibold text-red-500">{error}</p>
                )}
                <button
                  onClick={onSend}
                  disabled={pending || !message.trim()}
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                >
                  <Send className="size-3.5" />
                  {pending ? "Sending…" : "Send message"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        aria-label={open ? "Close support chat" : "Open support chat"}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_8px_24px_rgba(37,99,235,0.45)] transition-transform hover:scale-105"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>
    </>
  );
}
