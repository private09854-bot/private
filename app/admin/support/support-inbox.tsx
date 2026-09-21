"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Loader2, Mail, Circle } from "lucide-react";
import { replyToSupport, markConversationRead } from "@/app/actions/support";

type Msg = {
  id: string;
  sender: "customer" | "admin";
  message: string;
  createdAt: string;
};

export type Conversation = {
  key: string;
  userId: string | null;
  name: string;
  email: string;
  isGuest: boolean;
  messages: Msg[];
  unread: number;
  lastAt: string;
};

function timeLabel(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const mins = Math.floor((now - d.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function initials(name: string): string {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "?") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
}

export default function SupportInbox({
  conversations,
}: {
  conversations: Conversation[];
}) {
  const router = useRouter();
  const [selectedKey, setSelectedKey] = useState<string | null>(
    conversations[0]?.key ?? null,
  );
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const threadRef = useRef<HTMLDivElement>(null);

  const selected =
    conversations.find((c) => c.key === selectedKey) ?? null;

  // Mark a conversation read when the admin opens it.
  useEffect(() => {
    if (selected && !selected.isGuest && selected.userId && selected.unread > 0) {
      markConversationRead(selected.userId).then(() => router.refresh());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey]);

  // Keep the thread scrolled to the newest message.
  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [selectedKey, selected?.messages.length]);

  function send() {
    if (!selected?.userId || !reply.trim()) return;
    setError("");
    const userId = selected.userId;
    startTransition(async () => {
      const res = await replyToSupport({ userId, message: reply });
      if (res.error) {
        setError(res.error);
        return;
      }
      setReply("");
      router.refresh();
    });
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
        <Mail className="size-7 text-slate-300" />
        <p className="text-sm font-semibold text-slate-700">No messages yet</p>
        <p className="max-w-sm text-[13px] text-slate-500">
          When a customer sends a message from the support widget, their
          conversation opens here and you can reply.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row lg:items-stretch">
      {/* Conversation list */}
      <div
        className={`flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white lg:w-[320px] lg:shrink-0 ${
          selected ? "hidden lg:flex" : "flex"
        }`}
      >
        <div className="max-h-[70vh] overflow-y-auto">
          {conversations.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedKey(c.key)}
              className={`flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 ${
                selected?.key === c.key ? "bg-slate-50" : ""
              }`}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
                {initials(c.name)}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[13px] font-bold text-slate-900">
                    {c.name}
                  </p>
                  <span className="shrink-0 text-[11px] text-slate-400">
                    {timeLabel(c.lastAt)}
                  </span>
                </div>
                <p className="truncate text-[12px] text-slate-500">
                  {c.messages[c.messages.length - 1]?.sender === "admin"
                    ? "You: "
                    : ""}
                  {c.messages[c.messages.length - 1]?.message}
                </p>
              </div>
              {c.unread > 0 && (
                <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                  {c.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Thread */}
      <div
        className={`flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white ${
          selected ? "flex" : "hidden lg:flex"
        }`}
      >
        {selected ? (
          <>
            {/* Thread header */}
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3.5">
              <button
                onClick={() => setSelectedKey(null)}
                className="flex size-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
                aria-label="Back to list"
              >
                <ArrowLeft className="size-4" />
              </button>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
                {initials(selected.name)}
              </span>
              <div className="flex min-w-0 flex-col">
                <p className="truncate text-sm font-bold text-slate-900">
                  {selected.name}
                </p>
                <p className="truncate text-[11px] text-slate-500">
                  {selected.email}
                </p>
              </div>
              {selected.isGuest && (
                <span className="ml-auto rounded-md bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-600">
                  Guest
                </span>
              )}
            </div>

            {/* Messages */}
            <div
              ref={threadRef}
              className="flex flex-1 flex-col gap-3 overflow-y-auto bg-slate-50/60 p-4"
            >
              {selected.messages.map((m) => {
                const mine = m.sender === "admin";
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col gap-1 ${mine ? "items-end" : "items-start"}`}
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
                      {mine ? "Support" : selected.name.split(" ")[0]} ·{" "}
                      {timeLabel(m.createdAt)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Reply box */}
            {selected.isGuest ? (
              <div className="border-t border-slate-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-700">
                This message came from a signed-out visitor, so there is no
                account to reply into. Reach them at{" "}
                <span className="font-semibold">{selected.email}</span>.
              </div>
            ) : (
              <div className="flex flex-col gap-2 border-t border-slate-200 p-3">
                {error && (
                  <p className="text-[12px] font-semibold text-red-500">{error}</p>
                )}
                <div className="flex items-end gap-2">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
                    }}
                    rows={2}
                    maxLength={2000}
                    placeholder="Type your reply…  (⌘/Ctrl + Enter to send)"
                    className="flex-1 resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={send}
                    disabled={pending || !reply.trim()}
                    className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                    aria-label="Send reply"
                  >
                    {pending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
            <Circle className="size-6 text-slate-200" />
            <p className="text-[13px] text-slate-500">
              Select a conversation to read and reply.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
