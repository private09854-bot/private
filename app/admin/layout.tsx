import AdminSidebar from "@/components/admin-sidebar";
import { requireAdmin } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-50 lg:flex-row">
      <AdminSidebar
        user={{
          name: user.name,
          title: user.title ?? "System Overseer",
          avatar: user.avatar,
        }}
      />
      <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-10">
        {children}
      </main>
    </div>
  );
}
