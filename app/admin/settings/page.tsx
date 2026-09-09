import { Server, ShieldCheck, Users, Plug, Plus, ChevronDown } from "lucide-react";
import Badge from "@/components/ui/badge";
import Toggle from "@/components/ui/toggle";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

type Tone = "success" | "warning" | "danger" | "neutral";

const platformControls: { title: string; desc: string; on: boolean }[] = [
  { title: "Maintenance Mode", desc: "Temporarily suspend all customer sessions", on: false },
  { title: "New Registrations", desc: "Allow new account sign-ups", on: true },
  { title: "Global Transfer Freeze", desc: "Halt all outbound settlements", on: false },
  { title: "SWIFT Gateway", desc: "International wire routing", on: true },
];

const securityPolicy: { title: string; desc: string; on: boolean }[] = [
  { title: "Enforce 2FA for admins", desc: "Required for all overseer nodes", on: true },
  { title: "IP Allowlist", desc: "Restrict admin panel access", on: true },
  { title: "Audit Logging", desc: "Record every privileged action", on: true },
  { title: "Auto-freeze on risk > 90", desc: "Suspend accounts without review", on: false },
];

const GATEWAY_PROVIDER: Record<string, string> = {
  "SWIFT Network": "SwiftNet FIN",
  "USD Settlement": "Federal Reserve rail",
  "KYC Synapse": "Synapse Identity",
  "Ledger Core": "Internal · Node 04",
};

function gatewayTone(status: string): Tone {
  return status === "Degraded" ? "warning" : "success";
}

function roleInfo(user: { role: string; title: string | null }): {
  label: string;
  tone: Tone;
} {
  if (user.role === "ADMIN") return { label: user.title ?? "Super Admin", tone: "success" };
  return { label: "Delegated", tone: "neutral" };
}

export default async function AdminSettingsPage() {
  await requireAdmin();

  const [gateways, admins] = await Promise.all([
    prisma.gateway.findMany({ orderBy: { sort: "asc" } }),
    prisma.user.findMany({
      where: { OR: [{ role: "ADMIN" }, { title: "Primary Administrator" }] },
      orderBy: { role: "asc" },
    }),
  ]);

  return (
    <div className="flex h-full flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-extrabold text-slate-900">
            System Settings
          </h1>
          <p className="text-sm text-slate-600">
            Configure platform-wide controls, security policy and external
            integrations.
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-500">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          All changes auto-saved
        </span>
      </div>

      {/* Two-column config grid */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        {/* Platform controls */}
        <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <Server className="size-4 text-amber-500" />
            <h2 className="text-[15px] font-bold text-slate-900">
              Platform Controls
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {platformControls.map((c) => (
              <div key={c.title} className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[13px] font-semibold text-slate-900">
                    {c.title}
                  </p>
                  <p className="text-[11px] text-slate-500">{c.desc}</p>
                </div>
                <Toggle defaultOn={c.on} aria-label={c.title} />
              </div>
            ))}
          </div>
        </div>

        {/* Security policy */}
        <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-amber-500" />
            <h2 className="text-[15px] font-bold text-slate-900">
              Security Policy
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {securityPolicy.map((c) => (
              <div key={c.title} className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[13px] font-semibold text-slate-900">
                    {c.title}
                  </p>
                  <p className="text-[11px] text-slate-500">{c.desc}</p>
                </div>
                <Toggle defaultOn={c.on} aria-label={c.title} />
              </div>
            ))}
          </div>
          <div className="w-full border-t border-slate-200" />
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <p className="text-[13px] font-semibold text-slate-900">
                Session timeout
              </p>
              <p className="text-[11px] text-slate-500">Auto-logout idle admins</p>
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[13px] font-semibold text-slate-900 transition-colors hover:bg-slate-50">
              30 minutes
              <ChevronDown className="size-2.5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Integrations */}
        <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <Plug className="size-4 text-amber-500" />
            <h2 className="text-[15px] font-bold text-slate-900">Integrations</h2>
          </div>
          <div className="flex flex-col gap-3">
            {gateways.map((i) => (
              <div
                key={i.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
              >
                <div className="flex flex-col gap-0.5">
                  <p className="text-[13px] font-semibold text-slate-900">
                    {i.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {GATEWAY_PROVIDER[i.name] ?? "External provider"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={gatewayTone(i.status)}>{i.status}</Badge>
                  <button className="text-[13px] font-semibold text-blue-500 hover:text-blue-600">
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Access & roles */}
        <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-amber-500" />
            <h2 className="text-[15px] font-bold text-slate-900">
              Access &amp; Roles
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {admins.map((a) => {
              const info = roleInfo(a);
              return (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.avatar ?? "/avatars/sarah.png"}
                      alt={a.name}
                      className="size-9 rounded-full object-cover"
                    />
                    <p className="text-[13px] font-semibold text-slate-900">
                      {a.name}
                    </p>
                  </div>
                  <Badge tone={info.tone}>{info.label}</Badge>
                </div>
              );
            })}
          </div>
          <button className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 py-3 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-50">
            <Plus className="size-4" />
            Invite Admin
          </button>
        </div>
      </div>
    </div>
  );
}
