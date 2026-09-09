import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireCustomer } from "@/lib/session";
import SendForm from "./send-form";

export default async function SendToUserPage() {
  const user = await requireCustomer();

  const [recipients, wallets] = await Promise.all([
    prisma.recipient.findMany({
      where: { ownerId: user.id, type: "USER" },
      orderBy: { lastSent: "desc" },
    }),
    prisma.wallet.findMany({
      where: { ownerId: user.id },
      orderBy: { sort: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      {/* Title + tabs */}
      <div className="flex flex-col gap-5">
        <h1 className="text-[28px] font-bold text-slate-900">Send Money</h1>
        <div className="flex gap-3">
          <Link
            href="/send"
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
              To a Profintal Savings User
          </Link>
          <Link
            href="/send/bank"
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            To a Bank Account
          </Link>
        </div>
      </div>

      <SendForm
        recipients={recipients.map((r) => ({
          id: r.id,
          name: r.name,
          handle: r.handle,
          avatar: r.avatar,
        }))}
        wallets={wallets.map((w) => ({
          currency: w.currency,
          symbol: w.symbol,
          balance: w.balance,
          available: w.available,
        }))}
      />
    </div>
  );
}
