import Link from "next/link";
import {
  Landmark,
  Globe,
  ShieldCheck,
  Zap,
  Bell,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

const upcoming: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Globe,
    title: "SWIFT International",
    body: "Send to external bank accounts across 40+ countries on the global SWIFT network.",
  },
  {
    icon: ShieldCheck,
    title: "Guaranteed FX Rates",
    body: "Lock in mid-market exchange rates with no intermediary bank markups applied.",
  },
  {
    icon: Zap,
    title: "Direct Settlement",
    body: "Funds delivered in 1–3 business days with full end-to-end wire tracing.",
  },
];

export default function SendToBankPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Title + tabs */}
      <div className="flex flex-col gap-5">
        <h1 className="text-[28px] font-bold text-slate-900">Send Money</h1>
        <div className="flex gap-3">
          <Link
            href="/send"
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            To a Profintal Savings User
          </Link>
          <Link
            href="/send/bank"
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
            To a Bank Account
          </Link>
        </div>
      </div>

      {/* Coming soon */}
      <div className="relative flex flex-col items-center gap-10 overflow-hidden rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center">
        {/* Soft emerald backdrop */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-emerald-50 to-transparent" />

        {/* Icon + copy */}
        <div className="relative flex flex-col items-center gap-6">
          <div className="flex size-20 items-center justify-center rounded-3xl bg-slate-900">
            <Landmark className="size-9 text-emerald-500" />
          </div>
          <div className="flex flex-col items-center gap-4">
            <span className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.5px] text-amber-500">
              <span className="size-1.5 rounded-full bg-amber-500" />
              In Development
            </span>
            <h2 className="max-w-xl text-3xl font-extrabold tracking-[-0.5px] text-slate-900">
              Bank wire transfers are coming soon
            </h2>
            <p className="max-w-lg text-[15px] leading-relaxed text-slate-500">
              We&apos;re finalizing direct SWIFT settlement to external bank
              accounts. In the meantime, you can instantly send money to any
              Profintal Savings user free and in real time.
            </p>
          </div>
        </div>

        {/* What's coming */}
        <div className="relative grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-3">
          {upcoming.map((u) => {
            const Icon = u.icon;
            return (
              <div
                key={u.title}
                className="flex flex-col items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5 text-left"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
                  <Icon className="size-5" />
                </div>
                <p className="text-sm font-bold text-slate-900">{u.title}</p>
                <p className="text-xs leading-[1.5] text-slate-500">{u.body}</p>
              </div>
            );
          })}
        </div>

        {/* Notify + primary CTA */}
        <div className="relative flex w-full max-w-md flex-col gap-4">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 pl-4">
            <Bell className="size-4 shrink-0 text-slate-500" />
            <input
              type="email"
              placeholder="Enter your email to get notified"
              className="w-full bg-transparent text-[13px] text-slate-900 placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="button"
              className="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-slate-800"
            >
              Notify Me
            </button>
          </div>
          <Link
            href="/send"
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 p-4 text-[15px] font-bold text-white transition-colors hover:bg-emerald-600"
          >
            Send to a Profintal Savings User Instead
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
