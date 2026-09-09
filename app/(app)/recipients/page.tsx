import { prisma } from "@/lib/db";
import { requireCustomer } from "@/lib/session";
import { formatDate } from "@/lib/format";
import RecipientsView, {
  type UserRecipient,
  type BankRecipient,
} from "./recipients-view";

export default async function RecipientsPage() {
  const user = await requireCustomer();

  const recipients = await prisma.recipient.findMany({
    where: { ownerId: user.id },
    orderBy: [{ favorite: "desc" }, { lastSent: "desc" }],
  });

  const users: UserRecipient[] = recipients
    .filter((r) => r.type === "USER")
    .map((r) => ({
      id: r.id,
      name: r.name,
      handle: r.handle,
      avatar: r.avatar,
      favorite: r.favorite,
      meta: `${r.handle ?? ""}${
        r.lastSent ? ` • Last sent ${formatDate(r.lastSent)}` : ""
      }`,
    }));

  const bankAccounts: BankRecipient[] = recipients
    .filter((r) => r.type === "BANK")
    .map((r) => ({
      id: r.id,
      name: r.name,
      flag: r.flag,
      bankName: r.bankName,
      accountMask: r.accountMask,
      meta: r.lastSent ? `Last sent ${formatDate(r.lastSent)}` : "",
    }));

  return (
    <div className="flex h-full flex-col gap-8">
      <RecipientsView users={users} bankAccounts={bankAccounts} />
    </div>
  );
}
