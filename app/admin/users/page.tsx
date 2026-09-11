import { Search, ChevronDown, Download } from "lucide-react";
import Badge from "@/components/ui/badge";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/session";
import { formatDate } from "@/lib/format";
import KycReviewCard, { type ReviewApplicant } from "./kyc-review-card";

type Tone = "success" | "warning" | "danger" | "neutral";

const COUNTRY_NAME: Record<string, string> = {
  "🇺🇸": "United States",
  "🇧🇷": "Brazil",
  "🇸🇬": "Singapore",
  "🇮🇳": "India",
  "🇦🇪": "United Arab Emirates",
  "🇰🇷": "South Korea",
  "🇲🇽": "Mexico",
};

function tierTone(tier: string | null): Tone {
  if (tier === "Tier 3") return "success";
  if (tier === "Tier 2") return "neutral";
  if (tier === "Tier 1") return "warning";
  return "danger";
}

function statusInfo(kyc: string | null): { label: string; tone: Tone } {
  switch (kyc) {
    case "Verified":
      return { label: "Active", tone: "success" };
    case "Pending":
      return { label: "Pending", tone: "warning" };
    case "Frozen":
      return { label: "Frozen", tone: "danger" };
    case "Rejected":
      return { label: "Rejected", tone: "danger" };
    default:
      return { label: kyc ?? "Unknown", tone: "neutral" };
  }
}

function riskInfo(score: number): { label: string; tone: Tone } {
  if (score > 70) return { label: "High", tone: "danger" };
  if (score >= 30) return { label: "Medium", tone: "warning" };
  return { label: "Low", tone: "success" };
}

function docTone(state: string): Tone {
  if (state === "Pending") return "warning";
  if (state === "Rejected") return "danger";
  return "success";
}

function targetTier(requesting: string): string {
  const m = requesting.match(/\d+/g);
  return m && m.length ? `Tier ${m[m.length - 1]}` : "upgrade";
}

const filters = ["KYC Tier: All", "Status: All", "Region: All"];

export default async function AdminUsersPage() {
  await requireAdmin();

  const [usersRes, pendingRes, firstPendingRes] = await Promise.all([
    supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("role", "CUSTOMER")
      .order("joined"),
    supabaseAdmin
      .from("kyc_applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabaseAdmin
      .from("kyc_applications")
      .select("*, user:profiles(*), documents:kyc_documents(*)")
      .in("status", ["pending", "escalated"])
      .order("escalated", { ascending: false })
      .order("createdAt")
      .limit(1),
  ]);

  const users = usersRes.data ?? [];
  const pendingCount = pendingRes.count ?? 0;
  const firstPending = firstPendingRes.data?.[0] ?? null;

  const verified = users.filter((u) => u.kycStatus === "Verified").length;
  const frozenRejected = users.filter(
    (u) => u.kycStatus === "Frozen" || u.kycStatus === "Rejected",
  ).length;

  const kpis = [
    {
      label: "TOTAL ACCOUNTS",
      value: String(users.length),
      tone: "text-slate-900",
      sub: "Registered customers",
    },
    {
      label: "VERIFIED (TIER 3)",
      value: String(verified),
      tone: "text-emerald-500",
      sub: "KYC complete",
    },
    {
      label: "PENDING REVIEW",
      value: String(pendingCount),
      tone: "text-amber-500",
      sub: "Manual KYC queue",
    },
    {
      label: "FROZEN / REJECTED",
      value: String(frozenRejected),
      tone: "text-red-500",
      sub: "Compliance holds",
    },
  ];

  const applicant: ReviewApplicant = firstPending
    ? {
        id: firstPending.id,
        name: firstPending.user.name,
        handle: firstPending.user.handle ?? "",
        avatar: firstPending.user.avatar ?? "/avatars/sarah.png",
        flag: firstPending.user.country ?? "🏳️",
        requesting: firstPending.requesting,
        submitted: firstPending.submitted,
        targetTier: targetTier(firstPending.requesting),
        riskScore: firstPending.risk,
        riskLabel: riskInfo(firstPending.risk).label,
        riskTone: riskInfo(firstPending.risk).tone,
        documents: (
          firstPending.documents as { label: string; status: string }[]
        ).map((d) => ({
          label: d.label,
          state: d.status,
          tone: docTone(d.status),
        })),
      }
    : null;

  return (
    <div className="flex h-full flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-extrabold text-slate-900">
            User &amp; KYC Management
          </h1>
          <p className="text-sm text-slate-600">
            Review platform accounts, verification tiers and pending identity
            checks.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-900 transition-colors hover:bg-slate-50">
          <Download className="size-3.5 text-slate-500" />
          Export Registry
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-5"
          >
            <p className="text-[11px] font-bold tracking-[0.5px] text-slate-500">
              {k.label}
            </p>
            <p className={`text-2xl font-extrabold ${k.tone}`}>{k.value}</p>
            <p className="text-[11px] text-slate-600">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <Search className="size-3.5 shrink-0 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, handle or account ID..."
            className="w-full bg-transparent text-[13px] text-slate-900 placeholder:text-slate-500 focus:outline-none"
          />
        </div>
        {filters.map((f) => (
          <button
            key={f}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[13px] font-semibold text-slate-900 transition-colors hover:bg-slate-50"
          >
            {f}
            <ChevronDown className="size-2.5 text-slate-500" />
          </button>
        ))}
      </div>

      {/* Split workspace */}
      <div className="flex flex-1 flex-col gap-6 xl:flex-row xl:items-start">
        {/* Users table */}
        <div className="flex min-w-0 flex-1 flex-col overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 py-3 text-[11px] font-bold text-slate-500">
            <span className="flex-1">USER</span>
            <span className="w-[160px]">COUNTRY</span>
            <span className="w-[90px]">KYC TIER</span>
            <span className="w-[90px]">STATUS</span>
            <span className="w-[100px]">JOINED</span>
            <span className="w-[70px] text-right">ACTION</span>
          </div>
          <div className="flex flex-col">
            {users.map((u) => {
              const st = statusInfo(u.kycStatus);
              const action = u.kycStatus === "Verified" ? "View" : "Review";
              return (
                <div
                  key={u.id}
                  className={`flex items-center border-b border-slate-200 px-6 py-3.5 ${
                    u.flagged ? "bg-amber-100/25" : ""
                  }`}
                >
                  <div className="flex flex-1 items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={u.avatar ?? "/avatars/sarah.png"}
                      alt={u.name}
                      className="size-9 shrink-0 rounded-full object-cover"
                    />
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <p className="truncate text-[13px] font-semibold text-slate-900">
                        {u.name}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">
                        {u.handle ?? u.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex w-[160px] items-center gap-2">
                    <span className="text-sm">{u.country}</span>
                    <span className="truncate text-[13px] text-slate-600">
                      {COUNTRY_NAME[u.country ?? ""] ?? ""}
                    </span>
                  </div>
                  <div className="w-[90px]">
                    <Badge tone={tierTone(u.tier)}>{u.tier ?? "Unknown"}</Badge>
                  </div>
                  <div className="w-[90px]">
                    <Badge tone={st.tone}>{st.label}</Badge>
                  </div>
                  <span className="w-[100px] text-[13px] text-slate-600">
                    {formatDate(u.joined)}
                  </span>
                  <div className="flex w-[70px] justify-end">
                    <button className="text-[13px] font-semibold text-blue-500 hover:text-blue-600">
                      {action}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
            <p className="text-[13px] text-slate-500">
              Showing {users.length} of {users.length} accounts
            </p>
            <div className="flex items-center gap-2">
              <button className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100">
                Previous
              </button>
              <span className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-bold text-white">
                1
              </span>
              <button className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-900 transition-colors hover:bg-slate-50">
                Next
              </button>
            </div>
          </div>
        </div>

        {/* KYC review panel */}
        <KycReviewCard applicant={applicant} queued={pendingCount} />
      </div>
    </div>
  );
}
