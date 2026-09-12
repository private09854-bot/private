import { Download } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/session";
import { relativeTime, formatDateOnly } from "@/lib/format";
import { countryName } from "@/lib/countries";
import KycQueue, { type Applicant, type KycDoc } from "./kyc-queue";

type Tone = "success" | "warning" | "danger" | "neutral";

function riskInfo(score: number): { label: string; tone: Tone } {
  if (score > 70) return { label: "High", tone: "danger" };
  if (score >= 30) return { label: "Medium", tone: "warning" };
  return { label: "Low", tone: "success" };
}

function docTone(state: string): Tone {
  if (state === "Rejected") return "danger";
  if (state === "Verified" || state === "Cleared") return "success";
  if (state === "Not submitted") return "neutral";
  return "warning"; // Submitted / Pending
}

function targetTier(requesting: string): string {
  const m = requesting.match(/\d+/g);
  return m && m.length ? `Tier ${m[m.length - 1]}` : "upgrade";
}

export default async function AdminKycPage() {
  await requireAdmin();

  const { data: appRows } = await supabaseAdmin
    .from("kyc_applications")
    .select("*, user:profiles(*), documents:kyc_documents(*)")
    .neq("status", "draft")
    .order("escalated", { ascending: false })
    .order("createdAt");
  const apps = appRows ?? [];

  const applicants: Applicant[] = apps.map((a) => {
    const info = riskInfo(a.risk);
    const docs = a.documents as {
      id: string;
      label: string;
      status: string;
      fileName: string | null;
      fileSize: number | null;
    }[];
    const docCount = docs.length;
    const uploadedCount = docs.filter((d) => d.fileName).length;

    // Only the fields the customer actually filled in.
    const submission = [
      { label: "Document", value: a.documentType ?? "" },
      { label: "Number", value: a.documentNumber ?? "" },
      {
        label: "Issued by",
        value: a.issuingCountry ? countryName(a.issuingCountry) : "",
      },
      {
        label: "Expires",
        value: a.documentExpiry ? formatDateOnly(a.documentExpiry) : "",
      },
      { label: "Occupation", value: a.occupation ?? "" },
      { label: "Source of funds", value: a.sourceOfFunds ?? "" },
    ].filter((f) => f.value && f.value !== "—");

    return {
      id: a.id,
      name: a.user.name,
      handle: a.user.handle ?? "",
      avatar: a.user.avatar ?? "/avatars/sarah.png",
      flag: a.user.country ?? "🏳️",
      country: "",
      requesting: a.requesting,
      docsLabel: `${uploadedCount} of ${docCount}`,
      submittedLabel: relativeTime(a.submittedAt ?? a.createdAt),
      riskScore: a.risk,
      riskLabel: info.label,
      riskTone: info.tone,
      status: a.status,
      escalated: a.escalated,
      targetTier: targetTier(a.requesting),
      submission,
      documents: docs.map(
        (docm): KycDoc => ({
          id: docm.id,
          label: docm.label,
          state: docm.status,
          tone: docTone(docm.status),
          fileName: docm.fileName ?? null,
          fileSize: docm.fileSize ?? null,
        }),
      ),
    };
  });

  const kpis = [
    {
      label: "PENDING REVIEW",
      value: String(apps.filter((a) => a.status === "pending").length),
      tone: "text-amber-500",
      sub: "Manual verification queue",
    },
    {
      label: "ESCALATED",
      value: String(apps.filter((a) => a.status === "escalated").length),
      tone: "text-red-500",
      sub: "Compliance officer review",
    },
    {
      label: "APPROVED",
      value: String(apps.filter((a) => a.status === "approved").length),
      tone: "text-emerald-500",
      sub: "Decisions logged",
    },
    {
      label: "REJECTED",
      value: String(apps.filter((a) => a.status === "rejected").length),
      tone: "text-blue-500",
      sub: "Declined applications",
    },
  ];

  return (
    <div className="flex h-full flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-extrabold text-slate-900">
            KYC Verification Queue
          </h1>
          <p className="text-sm text-slate-600">
            Review pending identity submissions, document integrity and tier
            upgrade requests.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-900 transition-colors hover:bg-slate-50">
          <Download className="size-3.5 text-slate-500" />
          Export Compliance Log
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

      <KycQueue applicants={applicants} />
    </div>
  );
}
