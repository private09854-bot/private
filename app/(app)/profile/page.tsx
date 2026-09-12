import Link from "next/link";
import {
  BadgeCheck,
  ShieldAlert,
  Clock,
  Landmark,
  Wallet as WalletIcon,
  Gauge,
  Coins,
  AlertTriangle,
} from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireCustomer } from "@/lib/session";
import { usdRateMap } from "@/lib/data";
import {
  formatCurrency,
  formatDate,
  formatDateOnly,
  currencyFlag,
} from "@/lib/format";
import { countryName } from "@/lib/countries";

const NOT_SET = "—";

type Row = { label: string; value: string; mono?: boolean };

function InfoList({ rows }: { rows: Row[] }) {
  return (
    <div className="flex flex-col">
      {rows.map((r, i) => (
        <div
          key={r.label}
          className={`flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 ${
            i > 0 ? "border-t border-slate-200" : ""
          }`}
        >
          <span className="shrink-0 text-[13px] text-slate-500">{r.label}</span>
          <span
            className={`min-w-0 break-words text-sm font-semibold text-slate-900 sm:text-right ${
              r.mono ? "font-mono" : ""
            } ${r.value === NOT_SET ? "text-slate-400" : ""}`}
          >
            {r.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
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

const KYC_STYLE: Record<
  string,
  { tone: string; icon: typeof BadgeCheck; label: string }
> = {
  Verified: {
    tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: BadgeCheck,
    label: "Verified",
  },
  Pending: {
    tone: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
    label: "Not verified yet",
  },
  Rejected: {
    tone: "bg-red-50 text-red-600 border-red-200",
    icon: ShieldAlert,
    label: "Rejected",
  },
  Frozen: {
    tone: "bg-red-50 text-red-600 border-red-200",
    icon: ShieldAlert,
    label: "Frozen",
  },
};

export default async function ProfilePage() {
  const user = await requireCustomer();

  const [walletsRes, settingsRes, kycRes, rates] = await Promise.all([
    supabaseAdmin
      .from("wallets")
      .select("*")
      .eq("ownerId", user.id)
      .order("sort"),
    supabaseAdmin
      .from("user_settings")
      .select("*")
      .eq("ownerId", user.id)
      .maybeSingle(),
    supabaseAdmin
      .from("kyc_applications")
      .select("*, documents:kyc_documents(*)")
      .eq("userId", user.id)
      .maybeSingle(),
    usdRateMap(),
  ]);

  const wallets = walletsRes.data ?? [];
  const settings = settingsRes.data;
  const kyc = kycRes.data;
  const documents =
    (kyc?.documents as { id: string; label: string; status: string }[] | null) ??
    [];

  const primary = wallets.find((w) => w.primary) ?? wallets[0] ?? null;

  // Total holdings in USD equivalent across every wallet.
  const totalUsd = wallets.reduce(
    (sum, w) => sum + w.balance * (rates.get(w.currency) ?? 0),
    0,
  );

  const status = user.kycStatus ?? "Pending";
  const style = KYC_STYLE[status] ?? KYC_STYLE.Pending;
  const StatusIcon = style.icon;

  const fullName =
    [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ") ||
    user.name;

  const address =
    [user.addressLine, user.city, user.region, user.postalCode]
      .filter(Boolean)
      .join(", ") || NOT_SET;

  const identity: Row[] = [
    { label: "Full name", value: fullName },
    { label: "Username", value: user.username ? `@${user.username}` : NOT_SET },
    { label: "Email address", value: user.email },
    { label: "Mobile number", value: user.phone ?? NOT_SET, mono: true },
    {
      label: "Date of birth",
      value: user.dob ? formatDateOnly(user.dob) : NOT_SET,
    },
    { label: "Residential address", value: address },
    {
      label: "Country",
      value: user.countryCode ? countryName(user.countryCode) : NOT_SET,
    },
  ];

  const account: Row[] = [
    {
      label: "Account number",
      value: primary?.accountNumber ?? NOT_SET,
      mono: true,
    },
    { label: "Account type", value: user.accountType ?? NOT_SET },
    {
      label: "Primary currency",
      value: primary
        ? `${currencyFlag(primary.currency)}  ${primary.currency}`
        : NOT_SET,
    },
    { label: "Verification tier", value: user.tier ?? NOT_SET },
    { label: "Member since", value: formatDate(user.joined) },
    { label: "Routing (ACH)", value: primary?.achRouting ?? NOT_SET, mono: true },
    { label: "SWIFT / BIC", value: primary?.swift ?? NOT_SET, mono: true },
  ];

  // Sign-up details that are missing on accounts created before they existed.
  const missing = [
    !user.phone && "phone number",
    !user.dob && "date of birth",
    !user.addressLine && "address",
    !user.username && "username",
  ].filter(Boolean) as string[];

  const summary = [
    {
      icon: WalletIcon,
      label: "Account balance",
      value: formatCurrency(totalUsd, "USD"),
      sub: `Across ${wallets.length} ${wallets.length === 1 ? "wallet" : "wallets"}`,
    },
    {
      icon: Gauge,
      label: "Daily limit",
      value: formatCurrency(settings?.dailyLimit ?? 50000, "USD"),
      sub: `${formatCurrency(settings?.dailyUsed ?? 0, "USD")} used today`,
    },
    {
      icon: Landmark,
      label: "Monthly limit",
      value: formatCurrency(settings?.monthlyLimit ?? 500000, "USD"),
      sub: `${formatCurrency(settings?.monthlyUsed ?? 0, "USD")} used this month`,
    },
    {
      icon: Coins,
      label: "Single transfer cap",
      value: formatCurrency(settings?.singleCap ?? 10000, "USD"),
      sub: "Maximum per transaction",
    },
  ];

  return (
    <div className="flex h-full flex-col gap-8">
      {/* ------------------------------------------------------------ header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[28px] font-bold tracking-[-0.5px] text-slate-900">
          Account Profile
        </h1>
        <p className="text-sm text-slate-600">
          Everything on file for your account, including verification status.
        </p>
      </div>

      {/* ---------------------------------------------------------- identity */}
      <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.avatar ?? "/avatars/sarah.png"}
            alt=""
            className="size-16 shrink-0 rounded-full object-cover"
          />
          <div className="flex min-w-0 flex-col gap-1">
            <p className="truncate text-lg font-bold text-slate-900">
              {fullName}
            </p>
            <p className="truncate text-[13px] text-slate-500">
              {user.username ? `@${user.username} • ` : ""}
              {user.email}
            </p>
            <p className="text-[13px] text-slate-500">
              {user.accountType ?? "Account"} • {user.tier ?? "Tier 1"}
            </p>
          </div>
        </div>

        <span
          className={`flex w-fit shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-bold ${style.tone}`}
        >
          <StatusIcon className="size-4" />
          KYC: {style.label}
        </span>
      </div>

      {/* Nudge when the account predates the full sign-up form. */}
      {missing.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p className="text-[13px] leading-relaxed text-amber-900">
            <span className="font-bold">Your profile is incomplete.</span> We do
            not have your {missing.join(", ")} on file. This account was opened
            before those details were collected — verification cannot complete
            without them.{" "}
            <Link href="/kyc" className="font-bold underline">
              Verify your identity
            </Link>
            .
          </p>
        </div>
      )}

      {/* ----------------------------------------------------------- summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((s) => (
          <div
            key={s.label}
            className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-5"
          >
            <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              <s.icon className="size-3.5" />
              {s.label}
            </span>
            <p className="text-xl font-extrabold text-slate-900">{s.value}</p>
            <p className="text-[11px] text-slate-500">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ------------------------------------------------------------- lists */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="User information">
          <InfoList rows={identity} />
        </Card>

        <div className="flex flex-col gap-6">
          <Card title="Account details">
            <InfoList rows={account} />
          </Card>

          <Card title="Wallets">
            <div className="flex flex-col">
              {wallets.map((w, i) => (
                <div
                  key={w.id}
                  className={`flex items-center justify-between gap-4 px-5 py-4 ${
                    i > 0 ? "border-t border-slate-200" : ""
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="text-base leading-none">
                      {currencyFlag(w.currency)}
                    </span>
                    <span className="truncate text-sm font-semibold text-slate-900">
                      {w.currency}
                    </span>
                    {w.primary && (
                      <span className="shrink-0 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                        PRIMARY
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 font-mono text-sm font-bold text-slate-900">
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
        </div>
      </div>

      {/* --------------------------------------------------------------- KYC */}
      <Card title="Identity verification (KYC)">
        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold text-slate-900">
              {status === "Verified"
                ? "Your identity has been verified."
                : status === "Rejected"
                  ? "Your verification was declined."
                  : status === "Frozen"
                    ? "This account is frozen pending review."
                    : "Your documents are waiting on review."}
            </p>
            <p className="text-[13px] leading-relaxed text-slate-500">
              {kyc
                ? `Application opened ${formatDate(kyc.createdAt)} · requesting ${kyc.requesting}.`
                : "No verification application has been opened for this account yet."}
            </p>
          </div>

          {documents.length > 0 && (
            <div className="flex flex-col divide-y divide-slate-200 rounded-xl border border-slate-200">
              {documents.map((d) => {
                const ok = d.status === "Verified" || d.status === "Cleared";
                return (
                  <div
                    key={d.id}
                    className="flex items-center justify-between gap-4 px-4 py-3"
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
          )}

          {status !== "Verified" && (
            <Link
              href="/kyc"
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-[13px] font-bold text-white transition-colors hover:bg-emerald-700"
            >
              {kyc?.status === "pending" || kyc?.status === "escalated"
                ? "View your submission"
                : kyc?.status === "rejected"
                  ? "Submit again"
                  : "Start verification"}
            </Link>
          )}

          <p className="text-[11px] leading-relaxed text-slate-400">
            Profintal Savings is a demonstration project. Verification is
            reviewed from the admin console and no documents are transmitted to
            any real identity provider.
          </p>
        </div>
      </Card>

      <div className="pb-2">
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-[13px] font-semibold text-slate-900 transition-colors hover:bg-slate-50"
        >
          Security &amp; settings
        </Link>
      </div>
    </div>
  );
}
