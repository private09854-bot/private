import TopBar from "@/components/top-bar";
import { prisma } from "@/lib/db";
import { requireCustomer } from "@/lib/session";
import ConvertForm from "./convert-form";

export default async function ConvertPage() {
  const user = await requireCustomer();

  const [wallets, fx] = await Promise.all([
    prisma.wallet.findMany({
      where: { ownerId: user.id },
      orderBy: { sort: "asc" },
    }),
    prisma.fxRate.findMany(),
  ]);

  const rates: Record<string, number> = {};
  for (const r of fx) rates[`${r.base}/${r.quote}`] = r.rate;

  return (
    <div className="flex flex-col gap-8">
      <TopBar placeholder="Search fx rate histories, swap limits, active pairs...">
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500 bg-emerald-50 px-3 py-1.5">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold text-emerald-500">
            SWIFT Live Gateway
          </span>
        </div>
      </TopBar>

      <h1 className="text-[28px] font-bold text-slate-900">Convert Currency</h1>

      <ConvertForm
        wallets={wallets.map((w) => ({
          currency: w.currency,
          symbol: w.symbol,
          balance: w.balance,
          available: w.available,
        }))}
        rates={rates}
      />
    </div>
  );
}
