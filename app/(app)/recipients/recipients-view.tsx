"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Star, Trash2, X } from "lucide-react";
import {
  addRecipient,
  deleteRecipient,
  toggleRecipientFavorite,
} from "@/app/actions/banking";

export type UserRecipient = {
  id: string;
  name: string;
  handle: string | null;
  avatar: string | null;
  favorite: boolean;
  meta: string;
};
export type BankRecipient = {
  id: string;
  name: string;
  flag: string | null;
  bankName: string | null;
  accountMask: string | null;
  meta: string;
};

export default function RecipientsView({
  users,
  bankAccounts,
}: {
  users: UserRecipient[];
  bankAccounts: BankRecipient[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        (u.handle ?? "").toLowerCase().includes(q),
    );
  }, [users, query]);

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function submitAdd() {
    if (!name.trim()) return;
    await addRecipient({ name, handle });
    setName("");
    setHandle("");
    setAdding(false);
    refresh();
  }

  async function onToggleFavorite(id: string) {
    await toggleRecipientFavorite(id);
    refresh();
  }

  async function onDelete(id: string) {
    await deleteRecipient(id);
    refresh();
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-bold tracking-[-0.5px] text-slate-900">
            Recipients
          </h1>
          <p className="text-sm text-slate-600">
            Manage your saved corporate contacts, Vault users, and external bank
            accounts.
          </p>
        </div>
        <button
          onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-slate-800"
        >
          {adding ? <X className="size-3.5" /> : <Plus className="size-3.5" />}
          {adding ? "Cancel" : "Add Recipient"}
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500">
              FULL NAME
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Cooper"
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500">
              USERNAME (OPTIONAL)
            </label>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@jane_c"
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <button
            onClick={submitAdd}
            disabled={pending || !name.trim()}
            className="rounded-lg bg-emerald-500 px-5 py-2 text-[13px] font-bold text-white transition-colors hover:bg-emerald-600 disabled:opacity-60"
          >
            Save
          </button>
        </div>
      )}

      {/* Tabs + inner search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <button className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">
            Platform Users
          </button>
        </div>
        <div className="flex w-full items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 sm:w-[300px]">
          <Search className="size-3.5 shrink-0 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search recipients..."
            className="w-full bg-transparent text-[13px] text-slate-900 placeholder:text-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Split */}
      <div className="flex flex-1 flex-col gap-6 lg:flex-row lg:items-start">
        {/* Platform users */}
        <div className="flex flex-1 flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-7">
          <h2 className="text-base font-bold text-slate-900">
            Saved Platform Users
          </h2>
          <div className="flex flex-col gap-3">
            {filtered.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5"
              >
                <div className="flex items-center gap-3.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={u.avatar ?? "/avatars/sarah.png"}
                    alt={u.name}
                    className="size-10 rounded-full object-cover"
                  />
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-bold text-slate-900">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.meta}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggleFavorite(u.id)}
                    aria-label="Toggle favorite"
                  >
                    <Star
                      className={`size-[18px] transition-colors ${
                        u.favorite
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300 hover:text-amber-400"
                      }`}
                    />
                  </button>
                  <Link
                    href="/send"
                    className="flex items-center rounded-md bg-slate-900 px-3.5 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-slate-800"
                  >
                    Send
                  </Link>
                  <button
                    onClick={() => onDelete(u.id)}
                    aria-label="Delete recipient"
                    className="text-slate-300 transition-colors hover:text-red-500"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="py-6 text-center text-[13px] text-slate-500">
                No recipients found.
              </p>
            )}
          </div>
        </div>

        {/* Bank accounts preview */}
        <div className="flex h-full w-full shrink-0 flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 lg:w-[400px]">
          <h2 className="text-[15px] font-bold text-slate-900">
            Saved Bank Accounts (Preview)
          </h2>
          <div className="flex flex-col gap-3">
            {bankAccounts.map((b) => (
              <div
                key={b.id}
                className="flex flex-col gap-3.5 rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{b.flag}</span>
                    <span className="text-[13px] font-bold text-slate-900">
                      {b.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">{b.meta}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold text-slate-600">
                    {b.bankName}
                  </p>
                  <p className="font-mono text-[13px] font-bold text-slate-900">
                    Account ending {b.accountMask}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-2.5 text-xs font-semibold">
                  <button className="text-emerald-500 hover:text-emerald-600">
                    Edit Details
                  </button>
                  <button
                    onClick={() => onDelete(b.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {bankAccounts.length === 0 && (
              <p className="py-6 text-center text-[13px] text-slate-500">
                No saved bank accounts.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
