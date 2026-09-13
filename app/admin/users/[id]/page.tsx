import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/session";
import { usdRateMap } from "@/lib/data";
import {
  formatCurrency,
  formatDate,
  formatDateOnly,
  relativeTime,
  currencyFlag,
} from "@/lib/format";
import { countryName } from "@/lib/countries";
import Badge from "@/components/ui/badge";
import UserActions from "./user-actions";
import KycDecision from "./kyc-decision";

type Tone = "success" | "warning" | "danger" | "neutral";

const NOT_SET = "—";

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

function docTone(state: string): Tone {
  if (state === "Rejected") return "danger";
  if (state === "Verified" || state === "Cleared") return "success";
  if (state === "Not submitted") return "neutral";
  return "warning";
}

function Rows({ rows }: { rows: { label: string; value: string; mono?: boolean }[] }) {
  return (
    <div className="flex flex-col">
      {rows.map((r, i) => (
        <div
          key={r.label}
          className={`flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 ${
            i > 0 ? "border-t border-slate-200" : ""
          }`}
        >
          <span className="shrink-0 text-[13px] text-slate-500">{r.label}</span>
          <span
            className={`min-w-0 break-words text-[13px] font-semibold sm:text-right ${
              r.value === NOT_SET ? "text-slate-400" : "text-slate-900"
            } ${r.mono ? "font-mono" : ""}`}
          >
            {r.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {children}
      </div>
    </section>
  );
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();

  const [userRes, walletsRes, txnsRes, kycRes, settingsRes, rates] =
    await Promise.all([
      supabaseAdmin.from("profiles").select("*").eq("id", params.id).maybeSingle(),
      supabaseAdmin.from("wallets").select("*").eq("ownerId", params.id).order("sort"),
      supabaseAdmin
        .from("transactions")
        .select("*")
        .eq("ownerId", params.id)
        .order("date", { ascending: false })
        .limit(10),
      supabaseAdmin
        .from("kyc_applications")
        .select("*, documents:kyc_documents(*)")
        .eq("userId", params.id)
        .maybeSingle(),
      supabaseAdmin
        .from("user_settings")
        .select("*")
        .eq("ownerId", params.id)
        .maybeSingle(),
      usdRateMap(),
    ]);

  const user = userRes.data;
  if (!user) notFound();

  const wallets = walletsRes.data ?? [];
  const txns = txnsRes.data ?? [];
  const kyc = kycRes.data;
  const settings = settingsRes.data;
  const documents =
    (kyc?.documents as
      | { id: string; label: string; status: string; fileName: string | null }[]
      | null) ?? [];

  const primary = wallets.find((w) => w.primary) ?? wallets[0] ?? null;
  const totalUsd = wallets.reduce(
    (sum, w) => sum + w.balance * (rates.get(w.currency) ?? 0),
    0,
  );

  const st = statusInfo(user.kycStatus);
  const fullName =
    [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ") ||
    user.name;
  const address =
    [user.addressLine, user.city, user.region, user.postalCode]
      .filter(Boolean)
      .join(", ") || NOT_SET;

  const personal = [
    { label: "Full name", value: fullName },
    { label: "Username", value: user.username ? `@${user.username}` : NOT_SET },
    { label: "Email", value: user.email },
    { label: "Phone", value: user.phone ?? NOT_SET, mono: true },
    {
      label: "Date of birth",
      value: user.dob ? formatDateOnly(user.dob) : NOT_SET,
    },
    { label: "Address", value: address },
    {
      label: "Country",
      value: user.countryCode ? countryName(user.countryCode) : NOT_SET,
    },
  ];

  const account = [
    {
      label: "Account number",
      value: primary?.accountNumber ?? NOT_SET,
      mono: true,
    },
    { label: "Account type", value: user.accountType ?? NOT_SET },
    {
      label: "Primary currency",
      value: primary ? `${currencyFlag(primary.currency)}  ${primary.currency}` : NOT_SET,
    },
    { label: "Tier", value: user.tier ?? NOT_SET },
    { label: "Risk score", value: `${user.riskScore ?? 0} / 100` },
    { label: "Registered", value: formatDate(user.joined) },
    {
      label: "Terms accepted",
      value: user.termsAcceptedAt ? formatDate(user.termsAcceptedAt) : NOT_SET,
    },
    {
      label: "Daily limit",
      value: formatCurrency(settings?.dailyLimit ?? 50000, "USD"),
    },
    {
      label: "Single transfer cap",
      value: formatCurrency(settings?.singleCap ?? 10000, "USD"),
    },
  ];

  const submission = [
    { label: "Document type", value: kyc?.documentType ?? "" },
    { label: "Document number", value: kyc?.documentNumber ?? "" },
    {
      label: "Issuing country",
      value: kyc?.issuingCountry ? countryName(kyc.issuingCountry) : "",
    },
    {
      label: "Expires",
      value: kyc?.documentExpiry ? formatDateOnly(kyc.documentExpiry) : "",
    },
    { label: "Occupation", value: kyc?.occupation ?? "" },
    { label: "Source of funds", value: kyc?.sourceOfFunds ?? "" },
    {
      label: "Submitted",
      value: kyc?.submittedAt ? relativeTime(kyc.submittedAt) : "",
    },
  ].filter((r) => r.value);

  return (
    <div className="flex h-full flex-col gap-8">
      <Link
        href="/admin/users"
        className="flex w-fit items-center gap-2 text-[13px] font-semibold text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft className="size-4" />
        Back to users
      </Link>

      {/* Identity */}
      <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.avatar ?? "/avatars/sarah.png"}
            alt=""
            className="size-16 shrink-0 rounded-full object-cover"
          />
          <div className="flex min-w-0 flex-col gap-1.5">
            <p className="truncate text-lg font-bold text-slate-900">
              {user.country} {fullName}
            </p>
            <p className="truncate text-[13px] text-slate-500">
              {user.username ? `@${user.username} • ` : ""}
              {user.email}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={st.tone}>{st.label}</Badge>
              <Badge tone="neutral">{user.tier ?? "Tier 1"}</Badge>
              {user.flagged && <Badge tone="danger">Flagged</Badge>}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
          <div className="flex flex-col lg:items-end">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Total balance
            </p>
            <p className="text-2xl font-extrabold text-slate-900">
              {formatCurrency(totalUsd, "USD")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/send"
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-slate-800"
            >
              <Send className="size-3.5" />
              Send funds
            </Link>
            <UserActions userId={user.id} frozen={user.kycStatus === "Frozen"} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Personal information">
          <Rows rows={personal} />
        </Card>
        <Card title="Account">
          <Rows rows={account} />
        </Card>
      </div>

      {/* Wallets */}
      <Card title="Wallets">
        <div className="flex flex-col">
          {wallets.map((w, i) => (
            <div
              key={w.id}
              className={`flex items-center justify-between gap-4 px-5 py-3.5 ${
                i > 0 ? "border-t border-slate-200" : ""
              }`}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span className="text-base leading-none">
                  {currencyFlag(w.currency)}
                </span>
                <span className="text-[13px] font-semibold text-slate-900">
                  {w.currency}
                </span>
                {w.primary && (
                  <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                    PRIMARY
                  </span>
                )}
              </span>
              <span className="shrink-0 font-mono text-[13px] font-bold text-slate-900">
                {formatCurrency(w.balance, w.currency)}
              </span>
            </div>
          ))}
          {wallets.length === 0 && (
            <p className="px-5 py-8 text-center text-[13px] text-slate-500">
              No wallets on this account.
            </p>
          )}
        </div>
      </Card>

      {/* KYC */}
      <Card title="Identity verification">
        <div className="flex flex-col gap-5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-bold text-slate-900">
                {kyc
                  ? kyc.status === "draft"
                    ? "Not submitted yet"
                    : `Application ${kyc.status}`
                  : "No application opened"}
              </p>
              <p className="text-[11px] text-slate-500">
                {kyc?.reviewedAt
                  ? `Reviewed ${relativeTime(kyc.reviewedAt)}`
                  : kyc?.submittedAt
                    ? `Submitted ${relativeTime(kyc.submittedAt)}`
                    : "Waiting on the customer"}
              </p>
            </div>
            {kyc && kyc.status !== "draft" && (
              <KycDecision appId={kyc.id} status={kyc.status} />
            )}
          </div>

          {submission.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Rows rows={submission} />
            </div>
          )}

          {kyc?.reviewNote && (
            <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
              <span className="font-bold">Reason given:</span> {kyc.reviewNote}
            </p>
          )}

          {documents.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Documents
              </p>
              {documents.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="truncate text-[13px] font-semibold text-slate-900">
                      {d.label}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">
                      {d.fileName ?? "No file uploaded"}
                    </p>
                  </div>
                  <Badge tone={docTone(d.status)}>{d.status}</Badge>
                </div>
              ))}
              <p className="text-[11px] text-slate-400">
                Open documents from the{" "}
                <Link href="/admin/kyc" className="font-semibold underline">
                  KYC queue
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Activity */}
      <Card title="Recent activity">
        <div className="flex flex-col">
          {txns.map((t, i) => (
            <div
              key={t.id}
              className={`flex items-center justify-between gap-4 px-5 py-3.5 ${
                i > 0 ? "border-t border-slate-200" : ""
              }`}
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="truncate text-[13px] font-semibold text-slate-900">
                  {t.title}
                </p>
                <p className="truncate text-[11px] text-slate-500">
                  {t.ref} • {formatDate(t.date)}
                </p>
              </div>
              <span
                className={`shrink-0 font-mono text-[13px] font-bold ${
                  t.amount < 0 ? "text-slate-900" : "text-emerald-600"
                }`}
              >
                {formatCurrency(t.amount, t.currency, { sign: true })}
              </span>
            </div>
          ))}
          {txns.length === 0 && (
            <p className="px-5 py-8 text-center text-[13px] text-slate-500">
              No transactions on this account yet.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
