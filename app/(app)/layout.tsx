import AppSidebar from "@/components/app-sidebar";
import SupportChat from "@/components/support-chat";
import { requireCustomer } from "@/lib/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireCustomer();

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-50 lg:flex-row">
      <AppSidebar
        user={{ name: user.name, email: user.email, avatar: user.avatar }}
      />
      <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-10">
        {children}
      </main>
      <SupportChat />
    </div>
  );
}
