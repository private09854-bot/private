import Link from "next/link";
import Image from "next/image";
import {
  Lock,
  ShieldCheck,
  Activity,
  Network,
  Wallet,
  ArrowLeftRight,
  CreditCard,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Fingerprint,
  Check,
  ChevronDown,
  QrCode,
  Smartphone,
  Play,
  type LucideIcon,
} from "lucide-react";

const navLinks = ["Overview", "Banking", "Security", "Business", "Accounts"];

const heroStats = [
  { value: "$12.4B+", label: "Deposits protected" },
  { value: "99.99%", label: "Platform uptime" },
  { value: "4.9 / 5", label: "Customer rating" },
];

const metrics: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: ShieldCheck,
    title: "FDIC-Insured Banking",
    desc: "Eligible deposits are protected through partner banks.",
  },
  {
    icon: Lock,
    title: "Bank-Grade Encryption",
    desc: "Sensitive data is encrypted in transit and at rest.",
  },
  {
    icon: Activity,
    title: "Real-Time Monitoring",
    desc: "Instant transaction alerts and fraud detection.",
  },
  {
    icon: Network,
    title: "Connected Finances",
    desc: "Link external accounts for one complete view.",
  },
];

const features: {
  icon: LucideIcon;
  badge: string;
  title: string;
  desc: string;
  link: string;
}[] = [
  {
    icon: Wallet,
    badge: "Everyday banking",
    title: "Checking Built For Daily Money",
    desc: "Get paid, pay bills, move funds, and track cash flow from one secure account with clear balances and simple controls.",
    link: "Explore checking",
  },
  {
    icon: ArrowLeftRight,
    badge: "Fast transfers",
    title: "Send And Receive With Confidence",
    desc: "Move money by ACH, wire, or internal transfer with status updates, recipient controls, and secure approval steps.",
    link: "Explore transfers",
  },
  {
    icon: CreditCard,
    badge: "Virtual and physical",
    title: "Cards You Control",
    desc: "Issue cards for everyday spending, set limits, freeze instantly, and review purchases the moment they happen.",
    link: "Manage cards",
  },
  {
    icon: TrendingUp,
    badge: "Savings goals",
    title: "Save Toward What Matters",
    desc: "Separate money into goals, keep reserves visible, and earn competitive yield on eligible savings balances.",
    link: "Build savings",
  },
];

const creds: {
  name: string;
  amount: string;
  tag: string;
  tone: "active" | "linked";
  negative?: boolean;
}[] = [
  {
    name: "Chase Checking (•••• 8824)",
    amount: "$12,450.20",
    tag: "Active",
    tone: "active",
  },
  {
    name: "Vault Growth Savings (•••• 9901)",
    amount: "$45,210.50",
    tag: "Active",
    tone: "active",
  },
  {
    name: "Vault Debit Card (•••• 1005)",
    amount: "-$1,120.40",
    tag: "Linked",
    tone: "linked",
    negative: true,
  },
];

const bullets = [
  "See checking, savings, cards, and linked accounts in one place",
  "Categorize spending automatically with real-time balance updates",
  "Use secure connections that do not store external bank passwords",
  "Download statements and transaction history when you need records",
];

const securityCards: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Cpu,
    title: "Protected Infrastructure",
    desc: "Core systems are isolated, monitored, and designed to keep account access tightly controlled.",
  },
  {
    icon: Lock,
    title: "Encrypted Account Data",
    desc: "Personal information, transaction records, and authentication data are protected with strong encryption.",
  },
  {
    icon: Fingerprint,
    title: "Biometric Sign-In",
    desc: "Passkeys, device checks, and step-up verification help keep high-risk actions protected.",
  },
];

const integrityStats: {
  label: string;
  value: string;
  accent?: boolean;
  mono?: boolean;
}[] = [
  { label: "MONITORING", value: "Active 24/7", accent: true },
  { label: "LAST REVIEW", value: "Today, 11:24 AM", mono: true },
  { label: "ACCOUNT ACCESS", value: "Protected", accent: true },
];

const testimonials = [
  {
    quote: `"Vault gave our finance team one reliable place for operating cash, transfers, and team cards. Payroll week is finally calm."`,
    name: "Jonathan Wu",
    role: "CEO & Co-founder, Helio Technologies",
    avatar: "/avatars/john.png",
  },
  {
    quote: `"The transfer controls and transaction alerts are exactly what we needed. We can move fast without losing visibility."`,
    name: "Markus Vance",
    role: "Head of Operations, Conduit Software",
    avatar: "/avatars/alex.png",
  },
  {
    quote: `"I use Vault for checking, savings goals, and card spending. It feels modern, but still serious about security."`,
    name: "Clara Tremblay",
    role: "Small Business Owner",
    avatar: "/avatars/maria.png",
  },
];

const tiers: {
  name: string;
  label: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}[] = [
  {
    name: "Everyday Checking",
    label: "Personal",
    features: [
      "No minimum opening deposit",
      "Direct deposit and bill pay",
      "Instant virtual debit card",
      "Free standard ACH transfers",
      "Real-time spending alerts",
    ],
    cta: "Open Checking Account",
  },
  {
    name: "Growth Savings",
    label: "Save",
    features: [
      "Competitive yield on eligible balances",
      "Goal-based savings buckets",
      "Automatic recurring transfers",
      "Separate emergency reserve tracking",
      "Monthly statements and tax-ready history",
      "FDIC coverage through partner banks",
    ],
    cta: "Start Saving",
    highlighted: true,
  },
  {
    name: "Business Banking",
    label: "Business",
    features: [
      "Operating account for teams",
      "ACH, wire, and vendor payments",
      "Employee cards with spend limits",
      "Approval controls for large transfers",
      "Bookkeeping-friendly exports",
      "Priority onboarding support",
    ],
    cta: "Open Business Account",
  },
];

const mobileFeatures = [
  "Biometric sign-in",
  "Instant card lock",
  "Transfer approval alerts",
  "Virtual debit card in one tap",
];

const faqs = [
  {
    q: "How does Vault securely integrate with my external financial institutions?",
    a: "Vault uses secure bank connections where available, so you can view outside balances without sharing or storing your external banking password.",
  },
  {
    q: "Are Vault checking and savings balances FDIC-insured?",
    a: "Eligible deposit balances are held at partner banks, Members FDIC, and receive pass-through FDIC insurance up to applicable legal limits.",
  },
  {
    q: "Can I use Vault for both personal and business banking?",
    a: "Yes. Vault supports everyday personal accounts as well as business accounts with team cards, payment approvals, and exportable transaction history.",
  },
  {
    q: "How do card controls work?",
    a: "You can freeze a physical or virtual card, set spending limits, and receive purchase alerts directly from the Vault dashboard or mobile app.",
  },
];

const footerCols = [
  {
    title: "Products",
    links: ["Checking", "Savings", "Transfers", "Business Banking"],
  },
  {
    title: "Security",
    links: [
      "Account Protection",
      "Fraud Monitoring",
      "Card Controls",
      "Security Center",
    ],
  },
  {
    title: "Company",
    links: ["About Profintal Savings", "Careers", "Newsroom", "Contact"],
  },
  {
    title: "Resources",
    links: ["Help Center", "Fee Schedule", "System Status", "Disclosures"],
  },
];

function Logo() {
  return (
    <span className="flex items-center gap-3">
      <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white">
        <Image
          src="/profintal-savings-mark.svg"
          alt=""
          width={64}
          height={64}
          className="size-full object-cover"
          priority
        />
      </span>
      <span className="whitespace-nowrap text-base font-bold tracking-tight text-white">
        Profintal Savings
      </span>
    </span>
  );
}

function SectionHeader({
  eyebrow,
  title,
  desc,
  dark,
}: {
  eyebrow: string;
  title: string;
  desc: string;
  dark?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="text-sm font-bold uppercase tracking-[1px] text-emerald-500">
        {eyebrow}
      </p>
      <h2
        className={`max-w-3xl text-4xl font-bold tracking-[-1px] ${
          dark ? "text-white" : "text-slate-900"
        }`}
      >
        {title}
      </h2>
      <p
        className={`max-w-[720px] text-lg leading-[1.5] ${
          dark ? "text-slate-400" : "text-slate-500"
        }`}
      >
        {desc}
      </p>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="flex w-full flex-col bg-slate-50 font-sans">
      {/* ============ HERO ============ */}
      <section className="bg-slate-900">
        {/* Navbar */}
        <nav className="mx-auto flex h-[88px] w-full max-w-[1512px] items-center justify-between border-b border-slate-700 px-6 md:px-12 lg:px-20">
          <Logo />
          <div className="hidden items-center gap-8 text-sm font-medium text-slate-400 lg:flex">
            {navLinks.map((l) => (
              <a
                key={l}
                href="#"
                className="transition-colors hover:text-white"
              >
                {l}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-white transition-colors hover:text-emerald-400 sm:block"
            >
              Client Log In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-[13px] font-semibold text-slate-900 transition-colors hover:bg-emerald-400"
            >
              Open Account
            </Link>
          </div>
        </nav>

        {/* Hero content */}
        <div className="mx-auto flex w-full max-w-[1512px] flex-col items-center gap-12 px-6 pb-[100px] pt-16 md:px-12 lg:flex-row lg:px-20">
          {/* Left */}
          <div className="flex flex-1 flex-col items-start gap-6">
            <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-white">
                New Vault debit cards are ready for everyday spending
              </span>
            </div>
            <h1 className="text-5xl font-extrabold leading-[1.1] tracking-[-2px] text-white sm:text-[56px]">
              Modern banking for the way you move money.
            </h1>
            <p className="max-w-xl text-lg leading-[1.5] text-slate-400">
              Vault brings checking, savings, transfers, cards, and business
              payments into one secure fintech banking experience.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="rounded-lg bg-emerald-500 px-8 py-4 text-base font-semibold text-slate-900 transition-colors hover:bg-emerald-400"
              >
                Open An Account
              </Link>
              <a
                href="#accounts"
                className="rounded-lg border border-slate-200/20 px-8 py-4 text-base font-semibold text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
              >
                Compare Accounts
              </a>
            </div>
            <div className="flex flex-wrap gap-6 pt-4">
              {heroStats.map((s) => (
                <div key={s.label} className="flex flex-col gap-1">
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — dashboard mockup */}
          <div className="flex w-full max-w-[680px] flex-col gap-4 overflow-hidden rounded-[20px] border border-slate-700 bg-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/avatars/sarah.png"
                  alt="Sarah Jenkins"
                  className="size-8 rounded-2xl object-cover"
                />
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs font-semibold text-white">
                    Sarah Jenkins
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Active Secure Session
                  </p>
                </div>
              </div>
              <div className="rounded bg-emerald-50 px-2 py-1">
                <span className="text-[11px] font-bold text-emerald-500">
                  SECURE SESSION
                </span>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-1 flex-col gap-2 rounded-xl border border-slate-700 bg-slate-900 p-4">
                <p className="text-[11px] text-slate-400">AVAILABLE BALANCE</p>
                <p className="font-mono text-2xl font-bold text-white">
                  $71,641.10
                </p>
                <div className="flex items-center gap-1 text-[11px] text-emerald-500">
                  <TrendingUp className="size-2.5" />
                  +3.4% saved this month
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-2 rounded-xl border border-slate-700 bg-slate-900 p-4">
                <p className="text-[11px] text-slate-400">
                  CARD SPEND THIS MONTH
                </p>
                <p className="font-mono text-2xl font-bold text-red-500">
                  -$1,120.40
                </p>
                <p className="text-[11px] text-slate-400">
                  Across 2 active cards
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-slate-700 bg-slate-900 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-white">
                  Savings Progress YTD
                </p>
                <p className="text-[11px] text-emerald-500">On Track</p>
              </div>
              <svg
                viewBox="0 0 600 110"
                preserveAspectRatio="none"
                className="h-[110px] w-full"
              >
                <defs>
                  <linearGradient id="heroArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon
                  fill="url(#heroArea)"
                  points="0,85 60,70 120,78 180,55 240,63 300,40 360,49 420,28 480,36 540,18 600,12 600,110 0,110"
                />
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="0,85 60,70 120,78 180,55 240,63 300,40 360,49 420,28 480,36 540,18 600,12"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ============ METRICS STRIP ============ */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid w-full max-w-[1512px] grid-cols-1 gap-6 px-6 py-10 sm:grid-cols-2 md:px-12 lg:grid-cols-4 lg:px-20">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.title} className="flex items-center gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                  <Icon className="size-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-bold text-slate-900">{m.title}</p>
                  <p className="text-xs leading-[1.4] text-slate-500">
                    {m.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============ CORE FEATURES ============ */}
      <section className="bg-slate-50">
        <div className="mx-auto flex w-full max-w-[1512px] flex-col items-center gap-16 px-6 py-[120px] md:px-12 lg:px-20">
          <SectionHeader
            eyebrow="Banking Dashboard"
            title="All your banking in one clean dashboard"
            desc="Stop jumping between apps. Vault helps you manage everyday money, savings, cards, and transfers from a single secure place."
          />
          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-[0px_4px_6px_rgba(15,23,42,0.02)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                      <Icon className="size-5" />
                    </div>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-500">
                      {f.badge}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <h3 className="text-xl font-bold text-slate-900">
                      {f.title}
                    </h3>
                    <p className="text-sm leading-[1.5] text-slate-500">
                      {f.desc}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 pt-3 text-[13px] font-semibold text-emerald-500">
                    {f.link}
                    <ArrowRight className="size-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ SYNC SPOTLIGHT ============ */}
      <section className="bg-white">
        <div className="mx-auto flex w-full max-w-[1512px] flex-col items-center gap-20 px-6 py-[100px] md:px-12 lg:flex-row lg:px-20">
          {/* Visual */}
          <div className="flex w-full flex-col gap-5 rounded-[20px] border border-slate-200 bg-slate-50 p-8 lg:w-[620px]">
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold text-slate-900">
                Linked Accounts Overview
              </p>
              <span className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white">
                + Link Account
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {creds.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[13px] font-semibold text-slate-900">
                      {c.name}
                    </p>
                    <p
                      className={`font-mono text-base font-bold ${
                        c.negative ? "text-red-500" : "text-slate-900"
                      }`}
                    >
                      {c.amount}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                      c.tone === "active"
                        ? "bg-emerald-50 text-emerald-500"
                        : "bg-amber-100 text-amber-500"
                    }`}
                  >
                    {c.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* Text */}
          <div className="flex flex-1 flex-col gap-6">
            <p className="text-sm font-bold uppercase tracking-[1px] text-emerald-500">
              Real-time Consolidation
            </p>
            <h2 className="text-4xl font-extrabold tracking-[-1px] text-slate-900">
              One complete view of your money.
            </h2>
            <p className="text-base leading-[1.6] text-slate-500">
              Connect your outside accounts, review balances, and keep spending
              organized without juggling multiple tabs or downloading statements
              by hand.
            </p>
            <div className="flex flex-col gap-4">
              {bullets.map((b) => (
                <div key={b} className="flex items-center gap-3">
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
                  <p className="text-sm text-slate-900">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ SECURITY ============ */}
      <section className="bg-slate-900">
        <div className="mx-auto flex w-full max-w-[1512px] flex-col items-center gap-16 px-6 py-[120px] md:px-12 lg:px-20">
          <SectionHeader
            dark
            eyebrow="Security"
            title="Banking security that works quietly in the background"
            desc="Vault combines encryption, device verification, fraud monitoring, and strong authentication to help protect every account and transaction."
          />
          <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
            {securityCards.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.title}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-700 bg-slate-800 p-8"
                >
                  <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{c.title}</h3>
                  <p className="text-sm leading-[1.5] text-slate-400">
                    {c.desc}
                  </p>
                </div>
              );
            })}
          </div>
          {/* Integrity meta card */}
          <div className="flex w-full flex-col items-start justify-between gap-8 rounded-2xl border border-slate-700 bg-slate-800 p-8 lg:flex-row lg:items-center">
            <div className="flex max-w-xl flex-col gap-3">
              <h3 className="text-lg font-bold text-white">
                Continuous Account Protection
              </h3>
              <p className="text-sm leading-[1.5] text-slate-400">
                We monitor account activity around the clock, flag unusual
                behavior, and add extra verification for sensitive actions.
              </p>
            </div>
            <div className="flex flex-wrap gap-12">
              {integrityStats.map((s) => (
                <div key={s.label} className="flex flex-col gap-1">
                  <p className="text-xs text-slate-400">{s.label}</p>
                  <p
                    className={`text-lg font-bold ${
                      s.accent ? "text-emerald-500" : "text-white"
                    } ${s.mono ? "font-mono text-sm font-semibold" : ""}`}
                  >
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="bg-slate-50">
        <div className="mx-auto flex w-full max-w-[1512px] flex-col items-center gap-16 px-6 py-[120px] md:px-12 lg:px-20">
          <SectionHeader
            eyebrow="Customer Stories"
            title="Trusted by people and teams who move money every day"
            desc="See how customers use Vault for deposits, payments, card controls, and cleaner cash flow."
          />
          <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-[0px_4px_6px_rgba(15,23,42,0.02)]"
              >
                <p className="text-[15px] leading-[1.6] text-slate-500">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="size-10 rounded-full object-cover"
                  />
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-semibold text-slate-900">
                      {t.name}
                    </p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ACCOUNTS ============ */}
      <section id="accounts" className="bg-white">
        <div className="mx-auto flex w-full max-w-[1512px] flex-col items-center gap-16 px-6 py-[120px] md:px-12 lg:px-20">
          <SectionHeader
            eyebrow="Account Options"
            title="Choose the account that fits your financial life"
            desc="Start with everyday banking, grow savings automatically, or run business payments with controls built for teams."
          />
          <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
            {tiers.map((t) => (
              <div
                key={t.name}
                className={`flex flex-col gap-8 rounded-3xl border p-10 shadow-[0px_4px_6px_rgba(15,23,42,0.02)] ${
                  t.highlighted
                    ? "border-transparent bg-slate-900"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex flex-col gap-3">
                  <p
                    className={`text-xl font-bold ${
                      t.highlighted ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {t.name}
                  </p>
                  <p
                    className={`text-4xl font-extrabold ${
                      t.highlighted ? "text-emerald-500" : "text-slate-900"
                    }`}
                  >
                    {t.label}
                  </p>
                </div>
                <div
                  className={`h-px w-full ${
                    t.highlighted ? "bg-slate-700" : "bg-slate-200"
                  }`}
                />
                <div className="flex flex-col gap-4">
                  {t.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-3">
                      <Check className="size-4 shrink-0 text-emerald-500" />
                      <p
                        className={`text-sm ${
                          t.highlighted ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        {feat}
                      </p>
                    </div>
                  ))}
                </div>
                <Link
                  href="/signup"
                  className={`flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold transition-colors ${
                    t.highlighted
                      ? "bg-emerald-500 text-slate-900 hover:bg-emerald-400"
                      : "border border-slate-200 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {t.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MOBILE ============ */}
      <section className="bg-slate-900">
        <div className="mx-auto flex w-full max-w-[1512px] flex-col items-center gap-20 px-6 py-[100px] md:px-12 lg:flex-row lg:px-20">
          <div className="flex flex-1 flex-col gap-6">
            <p className="text-sm font-bold uppercase tracking-[1px] text-emerald-500">
              Mobile Banking
            </p>
            <h2 className="text-4xl font-extrabold tracking-[-1px] text-white">
              Your everyday banking in your pocket.
            </h2>
            <p className="max-w-xl text-base leading-[1.6] text-slate-400">
              Check balances, approve transfers, freeze cards, deposit checks,
              and review alerts from a secure mobile app built for daily
              banking.
            </p>
            <div className="flex flex-wrap gap-4 pt-3">
              <button className="flex items-center gap-3 rounded-[10px] border border-slate-700 bg-slate-800 px-6 py-3 transition-colors hover:bg-slate-700">
                <Smartphone className="size-[18px] text-white" />
                <span className="text-sm font-semibold text-white">
                  App Store
                </span>
              </button>
              <button className="flex items-center gap-3 rounded-[10px] border border-slate-700 bg-slate-800 px-6 py-3 transition-colors hover:bg-slate-700">
                <Play className="size-[18px] text-white" />
                <span className="text-sm font-semibold text-white">
                  Google Play
                </span>
              </button>
            </div>
          </div>
          <div className="flex w-full flex-col items-center gap-8 rounded-[20px] border border-slate-700 bg-slate-800 p-8 sm:flex-row lg:w-[520px]">
            <div className="flex shrink-0 flex-col items-center gap-4 rounded-xl border border-slate-700 bg-slate-900 p-5">
              <div className="flex size-[120px] items-center justify-center rounded-lg bg-white">
                <QrCode className="size-[104px] text-slate-900" />
              </div>
              <p className="text-center text-[11px] text-slate-400">
                Scan to download the app
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {mobileFeatures.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <Check className="size-3.5 shrink-0 text-emerald-500" />
                  <p className="text-[13px] text-white">{f}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="bg-slate-50">
        <div className="mx-auto flex w-full max-w-[1512px] flex-col items-center gap-16 px-6 py-[120px] md:px-12 lg:px-20">
          <SectionHeader
            eyebrow="Questions"
            title="Frequently asked questions"
            desc="Everything you need to know about Vault accounts, banking services, transfers, and security."
          />
          <div className="flex w-full max-w-4xl flex-col gap-4">
            {faqs.map((f) => (
              <div
                key={f.q}
                className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-base font-bold text-slate-900">{f.q}</p>
                  <ChevronDown className="size-4 shrink-0 text-slate-500" />
                </div>
                <p className="text-sm leading-[1.5] text-slate-500">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-slate-900">
        <div className="mx-auto flex w-full max-w-[1512px] flex-col gap-16 px-6 pb-12 pt-[100px] md:px-12 lg:px-20">
          <div className="flex flex-col justify-between gap-12 lg:flex-row">
            <div className="flex max-w-md flex-col gap-6">
              <Logo />
              <p className="text-sm leading-[1.5] text-slate-400">
                Vault is a fintech banking platform for checking, savings,
                transfers, card controls, and clear money management.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-12 md:grid-cols-4">
              {footerCols.map((col) => (
                <div key={col.title} className="flex w-[150px] flex-col gap-4">
                  <p className="text-[13px] font-bold uppercase tracking-[0.5px] text-white">
                    {col.title}
                  </p>
                  {col.links.map((l) => (
                    <a
                      key={l}
                      href="#"
                      className="text-[13px] text-slate-400 transition-colors hover:text-white"
                    >
                      {l}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="h-px w-full bg-slate-700" />
          <div className="flex flex-col gap-4 text-[11px] leading-[1.6] text-slate-400">
            <p>
              Profintal Savings is a financial technology platform, not a bank.
              Banking services are provided by partner banks, Members FDIC.
              Profintal Savings debit cards are issued by partner banks pursuant
              to license from the applicable card network. FDIC insurance
              applies only to eligible deposit balances held at partner banks
              and is subject to legal limits.
            </p>
            <p>
              Transfer timing, card availability, and account features may vary
              by eligibility, verification status, partner bank, and network
              rules. Linked account data may be delayed depending on the
              external financial institution.
            </p>
          </div>
          <div className="flex flex-col items-start justify-between gap-4 text-[13px] text-slate-400 sm:flex-row sm:items-center">
            <p>© 2026 Profintal Savings. All rights reserved.</p>
            <div className="flex flex-wrap gap-6">
              <a href="#" className="transition-colors hover:text-white">
                System Status
              </a>
              <a href="#" className="transition-colors hover:text-white">
                Privacy Policy
              </a>
              <a href="#" className="transition-colors hover:text-white">
                Terms of Use
              </a>
              <a href="#" className="transition-colors hover:text-white">
                Regulatory Disclosures
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
