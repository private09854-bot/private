import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireCustomer } from "@/lib/session";
import { formatDate } from "@/lib/format";
import TransactionsView, { type TxRow } from "./transactions-view";

export default async function TransactionsPage() {
  const user = await requireCustomer();

  const { data: txnRows } = await supabaseAdmin
    .from("transactions")
    .select("*")
    .eq("ownerId", user.id)
    .order("date", { ascending: false });
  const txns = txnRows ?? [];

  const rows: TxRow[] = txns.map((t) => ({
    id: t.id,
    ref: t.ref,
    dateLabel: formatDate(t.date),
    timeLabel: new Date(t.date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    kind: t.kind,
    title: t.title,
    sub: t.sub,
    currency: t.currency,
    amount: t.amount,
    fee: t.fee,
    status: t.status,
    party: t.party,
    walletSource: t.walletSource,
    delivery: t.delivery,
    reference: t.reference,
  }));

  return (
    <div className="flex h-full flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[28px] font-bold tracking-[-0.5px] text-slate-900">
          Transaction History
        </h1>
        <p className="text-sm text-slate-600">
          All activity across your consolidated multi-currency wallets.
        </p>
      </div>

      <TransactionsView rows={rows} />
    </div>
  );
}
