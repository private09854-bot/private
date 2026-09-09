import { CreditCard } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireCustomer } from "@/lib/session";
import { formatCurrency } from "@/lib/format";
import CardPanel from "./card-panel";

export default async function CardsPage() {
  const user = await requireCustomer();

  const card = await prisma.card.findFirst({
    where: { ownerId: user.id },
    include: { authorizations: { orderBy: { sort: "asc" } } },
  });

  if (!card) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] font-bold text-slate-900">Cards &amp; Limits</h1>
        <p className="text-sm text-slate-500">No cards issued yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Heading */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] font-bold text-slate-900">Cards &amp; Limits</h1>
        <p className="text-sm text-slate-500">
          Configure spending constraints, activate physical or virtual cards,
          and review localized merchant holds.
        </p>
      </div>

      {/* Workspace */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <CardPanel
          card={{
            id: card.id,
            name: card.name,
            brand: card.brand,
            last4: card.last4,
            holder: card.holder,
            expiry: card.expiry,
            spent: card.spent,
            limit: card.limit,
            frozen: card.frozen,
          }}
        />

        {/* Authorizations history */}
        <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_6px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold text-slate-900">
              Authorized Card Authorizations
            </p>
            <p className="text-[13px] text-slate-500">Showing last 30 days</p>
          </div>
          <div className="flex flex-col">
            {card.authorizations.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-4 border-b border-slate-200 py-4"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                  <CreditCard className="size-[18px] text-slate-700" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="text-sm font-semibold text-slate-900">
                    {a.merchant}
                  </p>
                  <p className="text-xs text-slate-500">
                    {a.category} • {a.when}
                  </p>
                </div>
                <p className="font-mono text-sm font-semibold text-slate-900">
                  {formatCurrency(a.amount, "USD", { sign: true })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
