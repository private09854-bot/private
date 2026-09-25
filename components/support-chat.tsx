"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send, CheckCircle2, Loader2 } from "lucide-react";
import {
  sendSupportMessage,
  getMyConversation,
  getMyUnreadCount,
  type SupportMessage,
} from "@/app/actions/support";

function timeLabel(iso: string): string {
  const d = new Date(iso);
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function SupportChat({ authed = false }: { authed?: boolean }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false); // guest one-way confirmation
  const [error, setError] = useState("");

  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const threadRef = useRef<HTMLDivElement>(null);

  const loadThread = useCallback(async () => {
    if (!authed) return;
    const res = await getMyConversation();
    setMessages(res.messages);
    setUnread(0);
  }, [authed]);

  // Poll the unread count in the background so the badge appears without opening.
  useEffect(() => {
    if (!authed) return;
    let alive = true;
    const tick = async () => {
      if (open) return;
      const n = await getMyUnreadCount();
      if (alive) setUnread(n);
    };
    tick();
    const id = setInterval(tick, 20000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [authed, open]);

  // Load the thread when opening, and keep it fresh while open.
  useEffect(() => {
    if (!open || !authed) return;
    setLoading(true);
    loadThread().finally(() => setLoading(false));
    const id = setInterval(loadThread, 15000);
    return () => clearInterval(id);
  }, [open, authed, loadThread]);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [messages.length, open]);

  async function onSend() {
    const text = message.trim();
    if (!text) return;
    setPending(true);
    setError("");
    const res = await sendSupportMessage({ message: text });
    setPending(false);
    if (!res.ok) {
      setError(res.error ?? "Could not send. Try again.");
      return;
    }
    setMessage("");
    if (authed) {
      await loadThread();
    } else {
      setSent(true);
    }
  }

  return (
    <>
      {/* Panel */}
      {open && (
        <div
          className={`fixed right-6 z-50 flex max-h-[70vh] w-[360px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.18)] ${
            authed ? "bottom-40 lg:bottom-24" : "bottom-24"
          }`}
        >
          <div className="flex items-center justify-between bg-blue-600 px-4 py-3.5">
            <div className="flex flex-col">
              <p className="text-sm font-bold text-white">Support</p>
              <p className="text-[11px] text-blue-100">
                {authed
                  ? "We usually reply within a few hours"
                  : "Leave a message and we'll reply by email"}
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

          {/* --- Signed-in customer: full conversation --- */}
          {authed ? (
            <>
              <div
                ref={threadRef}
                className="flex flex-1 flex-col gap-3 overflow-y-auto bg-slate-50/60 p-4"
              >
                {loading && messages.length === 0 ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="size-5 animate-spin text-slate-400" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="rounded-xl bg-white p-3 text-[13px] text-slate-600 shadow-sm">
                    👋 Hi! How can we help you today? Send us a message and our
                    team will reply right here.
                  </div>
                ) : (
                  messages.map((m) => {
                    const mine = m.sender === "customer";
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col gap-1 ${
                          mine ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                            mine
                              ? "rounded-br-sm bg-blue-600 text-white"
                              : "rounded-bl-sm border border-slate-200 bg-white text-slate-800"
                          }`}
                        >
                          {m.message}
                        </div>
                        <span className="px-1 text-[10px] text-slate-400">
                          {mine ? "You" : "Support"} · {timeLabel(m.createdAt)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex flex-col gap-2 border-t border-slate-200 p-3">
                {error && (
                  <p className="text-[12px] font-semibold text-red-500">
                    {error}
                  </p>
                )}
                <div className="flex items-end gap-2">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        onSend();
                      }
                    }}
                    rows={1}
                    placeholder="Type your message…"
                    className="max-h-24 flex-1 resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={onSend}
                    disabled={pending || !message.trim()}
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                    aria-label="Send message"
                  >
                    {pending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* --- Guest: one-way message --- */
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
                    👋 Hi! How can we help? Leave a message and we&apos;ll reply
                    by email. Have an account?{" "}
                    <a href="/login" className="font-semibold text-blue-600">
                      Sign in
                    </a>{" "}
                    to chat with us live.
                  </div>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="Type your message…"
                    className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {error && (
                    <p className="text-[12px] font-semibold text-red-500">
                      {error}
                    </p>
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
          )}
        </div>
      )}

      {/* Floating button */}
      <button
        aria-label={open ? "Close support chat" : "Open support chat"}
        onClick={() => setOpen((v) => !v)}
        className={`fixed right-6 z-50 flex size-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_8px_24px_rgba(37,99,235,0.45)] transition-transform hover:scale-105 ${
          authed ? "bottom-24 lg:bottom-6" : "bottom-6"
        }`}
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
        {!open && unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
    </>
  );
}
