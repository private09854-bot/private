import { CreditCard } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireCustomer } from "@/lib/session";
import { formatCurrency } from "@/lib/format";
import CardPanel from "./card-panel";
import IssueCards from "./issue-cards";

type CardAuth = {
  id: string;
  merchant: string;
  category: string;
  when: string;
  amount: number;
  sort: number;
};

export default async function CardsPage() {
  const user = await requireCustomer();

  const { data: cardRows } = await supabaseAdmin
    .from("cards")
    .select("*, authorizations:card_authorizations(*)")
    .eq("ownerId", user.id)
    .order("createdAt");
  const cards = cardRows ?? [];

  const hasVirtual = cards.some((c) => c.type === "virtual");
  const hasPhysical = cards.some((c) => c.type === "physical");

  // Card authorizations belong to whichever active card carries them.
  const activeWithAuths = cards.find(
    (c) => c.status === "active" && (c.authorizations?.length ?? 0) > 0,
  );
  const auths: CardAuth[] = (activeWithAuths?.authorizations ?? []).sort(
    (a: CardAuth, b: CardAuth) => a.sort - b.sort,
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Heading */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] font-bold text-slate-900">Cards &amp; Limits</h1>
        <p className="text-sm text-slate-500">
          Create a virtual card, request a physical one, set spending limits and
          freeze a card the moment you need to.
        </p>
      </div>

      {/* Workspace */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Left: cards + issuance */}
        <div className="flex w-full shrink-0 flex-col gap-6 lg:w-[420px]">
          {cards.map((card) => (
            <CardPanel
              key={card.id}
              card={{
                id: card.id,
                name: card.name,
                brand: card.brand,
                number: card.number ?? null,
                last4: card.last4,
                cvv: card.cvv ?? null,
                holder: card.holder,
                expiry: card.expiry,
                spent: card.spent,
                limit: card.limit,
                frozen: card.frozen,
                type: card.type ?? "virtual",
                status: card.status ?? "active",
              }}
            />
          ))}

          <IssueCards hasVirtual={hasVirtual} hasPhysical={hasPhysical} />
        </div>

        {/* Right: authorizations */}
        <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_6px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold text-slate-900">
              Recent Card Activity
            </p>
            <p className="text-[13px] text-slate-500">Last 30 days</p>
          </div>
          <div className="flex flex-col">
            {auths.length === 0 && (
              <div className="flex flex-col items-center gap-1.5 py-14 text-center">
                <CreditCard className="size-6 text-slate-300" />
                <p className="text-sm font-semibold text-slate-700">
                  No card activity yet
                </p>
                <p className="max-w-xs text-[13px] text-slate-500">
                  {cards.length === 0
                    ? "Create a card to start spending."
                    : "Purchases on your card will show up here."}
                </p>
              </div>
            )}
            {auths.map((a) => (
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
