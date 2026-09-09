import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { formatCurrency, currencyFlag } from "@/lib/format";
import AdminSendForm from "./admin-send-form";

export default async function AdminSendPage() {
  const admin = await requireAdmin();

  const [users, wallets] = await Promise.all([
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { name: "asc" },
    }),
    prisma.wallet.findMany({
      where: { ownerId: admin.id },
      orderBy: { sort: "asc" },
    }),
  ]);

  const treasuryTotal = wallets.find((w) => w.currency === "USD")?.balance ?? 0;

  return (
    <div className="flex h-full flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-extrabold text-slate-900">
            Send Funds
          </h1>
          <p className="text-sm text-slate-600">
            Disburse treasury funds directly to any platform user. Admin-only
            capability.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-amber-500 bg-amber-100/50 px-3.5 py-2">
          <span className="size-1.5 rounded-full bg-amber-500" />
          <span className="text-[13px] font-bold text-amber-600">
            Treasury: {formatCurrency(treasuryTotal, "USD")}
          </span>
        </div>
      </div>

      {/* Treasury balances strip */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {wallets.map((w) => (
          <div
            key={w.currency}
            className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-base leading-none">
                {currencyFlag(w.currency)}
              </span>
              <span className="text-[13px] font-bold text-slate-900">
                {w.currency}
              </span>
            </div>
            <p className="font-mono text-base font-bold text-slate-900">
              {formatCurrency(w.balance, w.currency)}
            </p>
          </div>
        ))}
      </div>

      <AdminSendForm
        users={users.map((u) => ({
          id: u.id,
          name: u.name,
          handle: u.handle,
          email: u.email,
          avatar: u.avatar,
        }))}
        wallets={wallets.map((w) => ({
          currency: w.currency,
          symbol: w.symbol,
          balance: w.balance,
        }))}
      />
    </div>
  );
}
