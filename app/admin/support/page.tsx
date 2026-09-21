import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/session";
import SupportInbox, { type Conversation } from "./support-inbox";

export default async function AdminSupportPage() {
  await requireAdmin();

  const { data } = await supabaseAdmin
    .from("support_messages")
    .select("id,userId,name,email,message,sender,readByAdmin,createdAt")
    .order("createdAt");

  const rows = data ?? [];

  // Group into conversations. Signed-in customers key on userId; guests (no
  // account) key on their email and can only be answered by email.
  const map = new Map<string, Conversation>();
  for (const m of rows) {
    const key = m.userId ? `user:${m.userId}` : `guest:${m.email}`;
    let conv = map.get(key);
    if (!conv) {
      conv = {
        key,
        userId: m.userId ?? null,
        name: m.name,
        email: m.email,
        isGuest: !m.userId,
        messages: [],
        unread: 0,
        lastAt: m.createdAt,
      };
      map.set(key, conv);
    }
    conv.messages.push({
      id: m.id,
      sender: m.sender,
      message: m.message,
      createdAt: m.createdAt,
    });
    conv.name = m.name;
    conv.email = m.email;
    conv.lastAt = m.createdAt;
    if (m.sender === "customer" && !m.readByAdmin) conv.unread += 1;
  }

  // Most recently active first.
  const conversations = Array.from(map.values()).sort(
    (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime(),
  );

  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);

  return (
    <div className="flex h-full flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[28px] font-extrabold text-slate-900">
          Support Inbox
        </h1>
        <p className="text-sm text-slate-600">
          {conversations.length === 0
            ? "Customer messages will appear here."
            : `${conversations.length} conversation${
                conversations.length === 1 ? "" : "s"
              }${totalUnread ? ` · ${totalUnread} unread` : ""}.`}
        </p>
      </div>

      <SupportInbox conversations={conversations} />
    </div>
  );
}
