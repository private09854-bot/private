import Link from "next/link";
import { Send, ArrowDownLeft, ArrowLeftRight, Plus, type LucideIcon } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireCustomer } from "@/lib/session";
import { formatCurrency, currencyFlag, formatDate } from "@/lib/format";
import CopyButton from "./copy-button";

interface ActionBtn {
  label: string;
  icon: LucideIcon;
  href: string;
  primary?: boolean;
}

const actions: ActionBtn[] = [
  { label: "Send", icon: Send, href: "/send", primary: true },
  { label: "Receive", icon: ArrowDownLeft, href: "/wallets" },
  { label: "Convert", icon: ArrowLeftRight, href: "/convert" },
  { label: "Add Money", icon: Plus, href: "/wallets" },
];

function activityTitle(kind: string, title: string, amount: number): string {
  if (kind === "convert") return title;
  return amount < 0 ? `Sent to ${title}` : `Received from ${title}`;
}

export default async function WalletsPage() {
  const user = await requireCustomer();

  const wallet =
    (await prisma.wallet.findFirst({
      where: { ownerId: user.id, primary: true },
    })) ??
    (await prisma.wallet.findFirst({
      where: { ownerId: user.id },
      orderBy: { sort: "asc" },
    }));

  if (!wallet) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] font-bold text-slate-900">Wallets</h1>
        <p className="text-sm text-slate-500">No wallets found.</p>
      </div>
    );
  }

  const txns = await prisma.transaction.findMany({
    where: { ownerId: user.id, currency: wallet.currency },
    orderBy: { date: "desc" },
  });

  const incoming = txns
    .filter((t) => t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);
  const outgoing = txns
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + t.amount, 0);
  const avg =
    txns.length > 0
      ? txns.reduce((s, t) => s + Math.abs(t.amount), 0) / txns.length
      : 0;

  const receivingDetails = [
    { label: "Account Holder", value: wallet.accountHolder ?? user.name },
    { label: "Account Number", value: wallet.accountNumber ?? "—" },
    { label: "Routing Number (ACH)", value: wallet.achRouting ?? "—" },
    { label: "Routing Number (Wire)", value: wallet.wireRouting ?? "—" },
    { label: "Bank Name", value: wallet.bankName ?? "—" },
    { label: "Bank Address", value: wallet.bankAddress ?? "—" },
    { label: "SWIFT / BIC Code", value: wallet.swift ?? "—" },
  ];

  const currencyName: Record<string, string> = {
    USD: "US Dollar",
    EUR: "Euro",
    GBP: "British Pound",
    NGN: "Nigerian Naira",
    CAD: "Canadian Dollar",
  };

  return (
    <div className="flex h-full flex-col gap-8">
      {/* Wallet header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-3xl border border-slate-200 text-2xl">
            {currencyFlag(wallet.currency)}
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-[28px] font-bold text-slate-900">
              {currencyName[wallet.currency] ?? wallet.currency} Wallet
            </h1>
            <p className="text-sm text-slate-500">
              Direct FDIC-insured deposit account • Vault {wallet.currency} Node
            </p>
          </div>
        </div>
        <div className="rounded-md border border-emerald-500 bg-emerald-50 px-3 py-1.5">
          <span className="text-xs font-bold text-emerald-500">
            Primary Settlement
          </span>
        </div>
      </div>

      {/* Balance showcase */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex flex-1 flex-col gap-4 rounded-2xl bg-slate-900 p-7">
          <p className="text-xs font-semibold text-slate-500">
            CONSOLIDATED BALANCE AVAILABLE
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-extrabold text-white">
              {formatCurrency(wallet.balance, wallet.currency)}
            </span>
            <span className="text-xl font-semibold text-emerald-500">
              {wallet.currency}
            </span>
          </div>
          <div className="flex gap-6 text-[13px] text-slate-500">
            <p>
              Available:{" "}
              <span className="font-semibold text-slate-300">
                {formatCurrency(
                  wallet.available ?? wallet.balance,
                  wallet.currency,
                )}
              </span>
            </p>
            <p>
              Pending:{" "}
              <span className="font-semibold text-slate-300">
                {formatCurrency(wallet.pending ?? 0, wallet.currency)}
              </span>
            </p>
          </div>
        </div>

        {/* Action hub */}
        <div className="flex w-full shrink-0 flex-col items-center gap-5 rounded-2xl border border-slate-200 bg-white p-7 lg:w-[400px]">
          <p className="text-sm font-bold text-slate-900">
            Instant Wallet Actions
          </p>
          <div className="flex w-full flex-wrap items-center justify-center gap-3">
            {actions.map((a) => {
              const Icon = a.icon;
              return (
                <Link
                  key={a.label}
                  href={a.href}
                  className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-[13px] font-semibold transition-colors ${
                    a.primary
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "border border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {a.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Details split */}
      <div className="flex flex-1 flex-col gap-6 lg:flex-row lg:items-start">
        {/* Receiving details */}
        <div className="flex flex-1 flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              {wallet.currency} Receiving Details
            </h2>
            <span className="text-xs font-semibold text-emerald-500">
              Global Swift Validated
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {receivingDetails.map((det) => (
              <div
                key={det.label}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <div className="flex flex-col gap-0.5">
                  <p className="text-[11px] font-semibold text-slate-500">
                    {det.label}
                  </p>
                  <p className="font-mono text-[13px] font-bold text-slate-900">
                    {det.value}
                  </p>
                </div>
                <CopyButton value={det.value} />
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="flex w-full shrink-0 flex-col gap-6 lg:w-[400px]">
          {/* Recent transactions */}
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-[15px] font-bold text-slate-900">
              Recent {wallet.currency} Transactions
            </h2>
            <div className="flex flex-col">
              {txns.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between border-b border-slate-200 py-2.5"
                >
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[13px] font-semibold text-slate-900">
                      {activityTitle(t.kind, t.title, t.amount)}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {formatDate(t.date)}
                    </p>
                  </div>
                  <p
                    className={`font-mono text-[13px] font-bold ${
                      t.amount > 0 ? "text-emerald-500" : "text-slate-900"
                    }`}
                  >
                    {formatCurrency(t.amount, t.currency, { sign: true })}
                  </p>
                </div>
              ))}
              {txns.length === 0 && (
                <p className="py-4 text-center text-[13px] text-slate-500">
                  No transactions yet.
                </p>
              )}
            </div>
          </div>

          {/* Insights */}
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-[15px] font-bold text-slate-900">
              {wallet.currency} Wallet Activity Insights
            </h2>
            <div className="flex flex-col gap-3 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total Incoming</span>
                <span className="font-bold text-emerald-500">
                  {formatCurrency(incoming, wallet.currency, { sign: true })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total Outgoing</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(outgoing, wallet.currency, { sign: true })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Average Transfer Size</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(avg, wallet.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
