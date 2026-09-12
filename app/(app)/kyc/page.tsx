import Link from "next/link";
import { BadgeCheck, Clock, ShieldAlert } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireCustomer } from "@/lib/session";
import { formatDate, formatDateOnly } from "@/lib/format";
import { countryName } from "@/lib/countries";
import KycForm from "./kyc-form";

export default async function KycPage() {
  const user = await requireCustomer();

  const { data: app } = await supabaseAdmin
    .from("kyc_applications")
    .select("*, documents:kyc_documents(*)")
    .eq("userId", user.id)
    .maybeSingle();

  const status = (app?.status as string | undefined) ?? "draft";
  const documents =
    (app?.documents as { id: string; label: string; status: string }[] | null) ??
    [];

  // Approved or awaiting review — show the receipt, not the form.
  const settled = status === "approved";
  const underReview = status === "pending" || status === "escalated";

  if (settled || underReview) {
    const Icon = settled ? BadgeCheck : Clock;
    return (
      <div className="flex h-full flex-col gap-8">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-bold tracking-[-0.5px] text-slate-900">
            Identity Verification
          </h1>
          <p className="text-sm text-slate-600">
            Your submission and its current status.
          </p>
        </div>

        <div
          className={`flex items-start gap-4 rounded-2xl border p-6 ${
            settled
              ? "border-emerald-200 bg-emerald-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <Icon
            className={`mt-0.5 size-6 shrink-0 ${
              settled ? "text-emerald-600" : "text-amber-600"
            }`}
          />
          <div className="flex flex-col gap-1">
            <p
              className={`text-base font-bold ${
                settled ? "text-emerald-900" : "text-amber-900"
              }`}
            >
              {settled
                ? "Your identity is verified"
                : status === "escalated"
                  ? "Under compliance review"
                  : "Documents received — under review"}
            </p>
            <p
              className={`text-[13px] leading-relaxed ${
                settled ? "text-emerald-800" : "text-amber-900"
              }`}
            >
              {settled
                ? `Approved${app?.reviewedAt ? ` on ${formatDate(app.reviewedAt)}` : ""}. Your account is now ${user.tier ?? "upgraded"}.`
                : `Submitted${app?.submittedAt ? ` ${formatDate(app.submittedAt)}` : ""}. An administrator will review your documents shortly — you do not need to do anything else.`}
            </p>
          </div>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            What you submitted
          </h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {[
              { label: "Document type", value: app?.documentType ?? "—" },
              { label: "Document number", value: app?.documentNumber ?? "—" },
              {
                label: "Issuing country",
                value: app?.issuingCountry
                  ? countryName(app.issuingCountry)
                  : "—",
              },
              {
                label: "Expires",
                value: app?.documentExpiry
                  ? formatDateOnly(app.documentExpiry)
                  : "—",
              },
              { label: "Occupation", value: app?.occupation ?? "—" },
              { label: "Source of funds", value: app?.sourceOfFunds ?? "—" },
            ].map((r, i) => (
              <div
                key={r.label}
                className={`flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
                  i > 0 ? "border-t border-slate-200" : ""
                }`}
              >
                <span className="text-[13px] text-slate-500">{r.label}</span>
                <span className="text-sm font-semibold text-slate-900">
                  {r.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Documents
          </h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {documents.map((d, i) => {
              const ok = d.status === "Verified" || d.status === "Cleared";
              return (
                <div
                  key={d.id}
                  className={`flex items-center justify-between gap-4 px-5 py-4 ${
                    i > 0 ? "border-t border-slate-200" : ""
                  }`}
                >
                  <span className="min-w-0 truncate text-[13px] text-slate-700">
                    {d.label}
                  </span>
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-bold ${
                      ok
                        ? "bg-emerald-50 text-emerald-600"
                        : d.status === "Rejected"
                          ? "bg-red-50 text-red-600"
                          : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <div>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-[13px] font-semibold text-slate-900 transition-colors hover:bg-slate-50"
          >
            Back to profile
          </Link>
        </div>
      </div>
    );
  }

  // draft or rejected — let them submit (again).
  return (
    <div className="flex h-full flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[28px] font-bold tracking-[-0.5px] text-slate-900">
          Identity Verification
        </h1>
        <p className="text-sm text-slate-600">
          Verify your identity to raise your limits and unlock full account
          access.
        </p>
      </div>

      {status === "rejected" && (
        <div className="flex items-start gap-4 rounded-2xl border border-red-200 bg-red-50 p-6">
          <ShieldAlert className="mt-0.5 size-6 shrink-0 text-red-600" />
          <div className="flex flex-col gap-1">
            <p className="text-base font-bold text-red-900">
              Your previous submission was declined
            </p>
            <p className="text-[13px] leading-relaxed text-red-800">
              {app?.reviewNote ??
                "Please check your documents are clear, in date, and match the name on your account, then submit again."}
            </p>
          </div>
        </div>
      )}

      <KycForm
        defaultCountry={user.countryCode ?? "US"}
        accountName={
          [user.firstName, user.middleName, user.lastName]
            .filter(Boolean)
            .join(" ") || user.name
        }
      />
    </div>
  );
}
