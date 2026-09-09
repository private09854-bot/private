import { prisma } from "@/lib/db";
import { requireCustomer } from "@/lib/session";
import { usdRateMap, portfolioUsd } from "@/lib/data";
import { formatCurrency } from "@/lib/format";
import WithdrawMethods from "./withdraw-methods";

export default async function WithdrawPage() {
  const user = await requireCustomer();

  const [wallets, rates] = await Promise.all([
    prisma.wallet.findMany({
      where: { ownerId: user.id },
      orderBy: { sort: "asc" },
    }),
    usdRateMap(),
  ]);

  const total = portfolioUsd(wallets, rates);

  return (
    <div className="flex h-full flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-bold tracking-[-0.5px] text-slate-900">
            Withdraw Funds
          </h1>
          <p className="text-sm text-slate-600">
            Choose a payout method to move funds out of your Profintal Savings wallets.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5">
          <span className="text-[11px] font-semibold text-slate-500">
            WITHDRAWABLE BALANCE
          </span>
          <span className="font-mono text-lg font-bold text-slate-900">
            {formatCurrency(total, "USD")} USD
          </span>
        </div>
      </div>

      {/* Methods */}
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-bold text-slate-900">Payout Methods</h2>
        <WithdrawMethods
          wallets={wallets.map((w) => ({
            currency: w.currency,
            symbol: w.symbol,
            balance: w.balance,
          }))}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-[13px] text-slate-500">
        Payouts are typically processed within 1–3 business days depending on the
        selected method. Fees and limits vary by rail and KYC tier.
      </div>
    </div>
  );
}
